# infra/

AMANG 인프라 매니페스트 디렉토리. K8s 매니페스트(Kustomize)와 Terraform IaC가 SSOT.

루트 [CLAUDE.md](../CLAUDE.md) 및 글로벌 [`~/.claude/rules/kubernetes.md`](file:///home/json/.claude/rules/kubernetes.md), [`~/.claude/rules/terraform.md`](file:///home/json/.claude/rules/terraform.md) 규칙을 따른다. 본 문서는 **AMANG 프로젝트 전용 컨벤션**만 담는다.

## 디렉토리 구조

```
infra/
├── k8s/
│   └── {component}/                    # api, db, web, redis, ...
│       ├── base/                       # 공통 매니페스트 (deployment, service, pvc, configmap)
│       └── overlays/
│           ├── staging/                # 환경별 namespace, ingress, NetworkPolicy, SealedSecret
│           └── production/
└── terraform/
    └── {provider}/                     # vercel, aws, ...
```

ArgoCD Application 정의는 **별도 레포**([homelab](https://github.com/manamana32321/homelab/tree/main/k8s/argocd/applications/apps/amang))에 있다. 신규 컴포넌트 추가 시 homelab repo에도 PR 필요.

## Namespace 컨벤션

**`amang-{component}-{env}`** 패턴. 컴포넌트별로 namespace를 분리한다.

| Namespace | 용도 |
|---|---|
| `amang-api-{staging,production}` | NestJS API + migrate/seed Job |
| `amang-db-{staging,production}` | PostgreSQL |
| `amang-web-{staging,production}` | Next.js 웹 (Vercel 배포 시 미사용 가능) |
| `amang-redis-{staging,production}` | Redis |

**왜 컴포넌트별 분리인가**: NetworkPolicy의 `namespaceSelector` cross-namespace 참조를 명시적으로 만들어 권한 경계를 ns 단위로 관리. 단일 ns에 모두 두면 모든 pod가 모든 Service에 접근 가능해짐.

### Namespace SSOT는 ArgoCD `destination.namespace`

Kustomize overlay의 `kustomization.yaml`에 `namespace:` 필드를 **명시하지 않는다**. namespace 결정은 ArgoCD Application의 `destination.namespace`가 SSOT이며, ArgoCD가 sync 시 모든 namespaced 리소스에 자동 적용한다 (`syncOptions: CreateNamespace=true`로 ns 자체도 자동 생성).

이렇게 하면:
- "어디 배포되는지"를 한 곳(homelab repo의 ArgoCD Application)에서만 변경 가능
- amang repo의 Kustomize는 컴포넌트가 어떤 ns에 가는지 모름 — 재사용성 ↑
- ApplicationSet generator로 staging/production 환경 매트릭스 깔끔

**예외 — SealedSecret은 sealing 시 metadata.namespace가 cert에 박힘**: sealed-secrets controller가 strict scope로 동작하므로 sealing 시 명시한 namespace에서만 복호화. 따라서 SealedSecret YAML에는 namespace가 박혀있고, **ArgoCD destination.namespace와 일치해야 함** (불일치 시 controller가 reject). 환경별로 별도 sealing 필요.

> **현재 상태**: redis는 이 룰을 따른다. db/api는 아직 `kustomization.yaml`에 `namespace:` 필드 명시 + `namespace.yaml` 별도 — 후속 리팩토링 필요 ([infra/k8s/db/](k8s/db/), [infra/k8s/api/](k8s/api/) overlays).

## 이미지 버전 정책

### 자체 빌드 이미지 (api, web)

- 레지스트리: **GHCR** (`ghcr.io/skku-amang/amang-{component}`)
- 태그: `:latest` (Deployment) + ArgoCD Image Updater가 SHA로 write-back
- 새 이미지는 GitHub Actions에서 빌드 → push → Image Updater가 평균 ~1분 후 감지

### Public 이미지 (postgres, redis 등)

- **마이너 버전까지 핀**, alpine 변형 선호 (예: `postgres:16.10-alpine`, `redis:8.4-alpine`)
- `:latest` 태그 절대 금지
- Image Updater 사용 안 함 — 메이저/마이너 업그레이드는 사람이 의식적으로 PR

### 버전 선택 규칙

1. **공식 LTS가 있으면 LTS 채택** (예: Node, Postgres major)
2. **공식 LTS가 없으면 직전 minor의 stable**(latest minor − 1) 채택
   - 이유: latest minor는 곧 fully-supported 자리에서 밀려나 EOL 가까움. 직전 minor는 안정성 검증 끝났고 보안 패치 보장
   - 예: Redis는 공식 LTS 없음 → latest=8.6이면 **8.4 핀**
3. **EOL 확인 필수**: 신규 컴포넌트 추가 또는 메이저 업그레이드 시 [endoflife.date](https://endoflife.date/)에서 종료일 확인. EOL 6개월 이내 버전 채택 금지
4. Docker Hub의 태그 alive ≠ upstream 보안 패치 alive. 항상 **upstream 프로젝트** 기준 EOL 확인

## SealedSecret

핵심 규칙:

- **AMANG은 homelab cluster에 배포된다** (ArgoCD `destination.server: https://kubernetes.default.svc` — ArgoCD가 운영되는 cluster 자기 자신). staging/production은 같은 cluster의 namespace 분리
- 따라서 **모든 환경의 SealedSecret은 homelab cluster의 sealed-secrets controller로 sealing**해야 함. 다른 cluster cert로 sealing하면 복호화 실패 → 배포 장애
- 본인 로컬 kubeconfig에서 homelab cluster를 어떤 파일/context로 등록했는지는 자유. KUBECONFIG 환경변수로 명시 prefix:

  ```bash
  KUBECONFIG=<your-homelab-kubeconfig> kubeseal --raw \
    --namespace=amang-<component>-<env> --name=<secret-name>
  ```

- 잘못된 cluster cert로 sealing 방지: 글로벌 hook(`kubeseal-guard.sh`)이 KUBECONFIG prefix 검사. 본인 환경 매핑은 `~/.kube/CLAUDE.md`(있다면) 또는 ArgoCD UI에서 cluster 식별
- 평문 Secret 또는 "나중에 SealedSecret으로 전환" TODO 주석 패턴 금지 — 첫 커밋부터 SealedSecret으로
- SealedSecret 전환 시 **기존 평문 Secret 수동 삭제** 필수 (controller는 평문을 자동 삭제하지 않음)

## NetworkPolicy

- **base에 두지 않고 overlay에 둔다**: `namespaceSelector` cross-ns 참조 값(`amang-api-staging` vs `amang-api-production`)이 환경마다 다르고, 환경별 허용 클라이언트 차이(예: production만 Grafana ro 허용)가 있을 수 있음
- 패턴: 컴포넌트 ns에 ingress default-deny → 명시적 namespaceSelector + podSelector + port로 허용
- 예시: [infra/k8s/db/overlays/production/network-policy.yaml](k8s/db/overlays/production/network-policy.yaml)

## Probe / Resources / 환경 변수

### Liveness / Readiness Probe

- **자체 앱**: `/health` HTTP 엔드포인트 구현 후 둘 다 등록 (api는 `@nestjs/terminus`)
- **공식 이미지**: 이미지가 제공하는 헬스체크 활용. 없으면 스킵 (Postgres `pg_isready`, Redis `redis-cli ping` 등 exec probe 가능하나 필수 아님)

### Resources

- 작은 동아리 규모 기준 default: `requests 256Mi/250m`, `limits 512Mi/500m`
- 메모리 부담 큰 컴포넌트(DB)는 별도 산정. PVC 별도 관리

### 환경 변수 주입

- **공통값**: `base/configmap.yaml` + `envFrom: configMapRef`
- **환경별 값**: `overlays/{env}/kustomization.yaml`의 `patches`로 ConfigMap에 add
- **시크릿**: SealedSecret → Secret → `envFrom: secretRef`

## ArgoCD Application

별도 레포 [homelab `k8s/argocd/applications/apps/amang/`](https://github.com/manamana32321/homelab/tree/main/k8s/argocd/applications/apps/amang)에 컴포넌트별 yaml 파일.

신규 컴포넌트 추가 시 필수 항목:
- `repoURL`: amang repo
- `path`: `infra/k8s/{component}/overlays/{env}`
- `destination.namespace`: `amang-{component}-{env}`
- `syncPolicy.automated`: `prune: true`, `selfHeal: true`
- `syncPolicy.syncOptions`: 신규 namespace면 `CreateNamespace=true`
- 자체 빌드 이미지면 [image-updater.yaml](https://github.com/manamana32321/homelab/blob/main/k8s/argocd/applications/apps/amang/image-updater.yaml)에 등록

## 검증 절차 (배포 후)

[글로벌 kubernetes.md](file:///home/json/.claude/rules/kubernetes.md) 준수. 핵심:

```bash
# hard refresh 먼저 (Argo poll interval ~3분 stale 방지)
kubectl -n argocd patch app {app-name} --type=merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
argocd app wait {app-name} --sync --health --timeout=600

# Secret 빈 값 함정 검증
kubectl -n {ns} get secret {secret-name} -o json | \
  jq '.data | map_values(@base64d | length)'
```

manifest-only 변경은 동기 검증, 이미지 빌드 거치는 변경은 ~3-5분 비동기 갭 → `ScheduleWakeup` 활용.

## Terraform

[글로벌 terraform.md](file:///home/json/.claude/rules/terraform.md) 준수. 추가 사항:

- 현재 `infra/terraform/vercel/`만 운영. AWS는 미정
- `terraform.tfvars` 커밋 금지 (`.gitignore` 등록), `terraform.tfvars.example`만 커밋
- backend state는 추후 S3로 전환 예정 (현재는 로컬, 1인 운영 한정 허용)
