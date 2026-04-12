# grafana_ro 역할 부트스트랩 런북

AMANG 프로덕션 DB에 Grafana용 read-only 유저(`grafana_ro`)를 생성/관리하는 절차.

## 배경

ArgoCD Sync 훅 Job으로 자동화를 시도했으나 ([PR #461](https://github.com/skku-amang/main/pull/461), [#464](https://github.com/skku-amang/main/pull/464)) Alpine postgres 이미지의 `sh`에서 psql heredoc + 환경변수 조합이 예측대로 동작하지 않아 포기. 1회성 부트스트랩 + 드문 rotation이라 수동 runbook이 더 단순하고 안전함.

## 1회 부트스트랩

```bash
SU=$(kubectl get secret amang-db-credentials -n amang-db-production -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
DB=$(kubectl get secret amang-db-credentials -n amang-db-production -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
PW=$(kubectl get secret grafana-ro-credentials -n amang-db-production -o jsonpath='{.data.GRAFANA_RO_PASSWORD}' | base64 -d)

# 1. 역할 생성 (이미 있으면 no-op)
printf "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='grafana_ro') THEN CREATE ROLE grafana_ro LOGIN; END IF; END \$\$;\n" \
  | kubectl exec -i -n amang-db-production deploy/postgres -- psql -U "$SU" -d "$DB" -v ON_ERROR_STOP=1

# 2. 비밀번호 + 권한 설정
printf "ALTER ROLE grafana_ro WITH PASSWORD '%s';\nGRANT CONNECT ON DATABASE %s TO grafana_ro;\nGRANT USAGE ON SCHEMA public TO grafana_ro;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO grafana_ro;\nALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafana_ro;\n" "$PW" "$DB" \
  | kubectl exec -i -n amang-db-production deploy/postgres -- psql -U "$SU" -d "$DB" -v ON_ERROR_STOP=1
```

## 비밀번호 rotation

```bash
# 새 비번 생성
NEW_PW=$(openssl rand -base64 36 | tr -d '/+=' | head -c 32)

# ALTER USER (DB 적용 — 러닝 파드 연결 실패 시작)
printf "ALTER ROLE grafana_ro WITH PASSWORD '%s';\n" "$NEW_PW" \
  | kubectl exec -i -n amang-db-production deploy/postgres -- psql -U "$SU" -d "$DB" -v ON_ERROR_STOP=1

# SealedSecret 재봉인 + 커밋
kubectl create secret generic grafana-ro-credentials -n amang-db-production \
  --from-literal=GRAFANA_RO_PASSWORD="$NEW_PW" \
  --from-literal=DATABASE_URL="postgresql://grafana_ro:${NEW_PW}@postgres-svc.amang-db-production.svc.cluster.local:5432/amang?sslmode=disable" \
  --dry-run=client -o yaml \
  | kubeseal --controller-namespace=kube-system --controller-name=sealed-secrets-controller \
    --format yaml > infra/k8s/db/overlays/production/sealed-grafana-ro.yaml

# reflector annotation 다시 붙이고 커밋 → PR 머지 → ArgoCD sync → Grafana rollout
```

## 권한 검증

```bash
PW=$(kubectl get secret grafana-ro-credentials -n amang-db-production -o jsonpath='{.data.GRAFANA_RO_PASSWORD}' | base64 -d)
kubectl run pg-roverify --rm -it --restart=Never -n amang-db-production \
  --image=postgres:16.10-alpine \
  --overrides='{"metadata":{"labels":{"app":"api-job"}}}' \
  --env="PGPASSWORD=$PW" \
  --command -- psql -h postgres-svc -U grafana_ro -d amang -c "SELECT count(*) FROM users;"
# → 성공해야 함

kubectl run pg-writetest --rm -it --restart=Never -n amang-db-production \
  --image=postgres:16.10-alpine \
  --overrides='{"metadata":{"labels":{"app":"api-job"}}}' \
  --env="PGPASSWORD=$PW" \
  --command -- psql -h postgres-svc -U grafana_ro -d amang -c "UPDATE users SET name='x' WHERE id=0;"
# → permission denied 나와야 함
```
