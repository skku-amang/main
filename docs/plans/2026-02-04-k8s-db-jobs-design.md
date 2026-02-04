# Kubernetes DB Migration/Seed Jobs 설계

## 개요

각 환경별(staging, production)로 DB 마이그레이션과 시드 작업을 Kubernetes Job으로 구성

## 결정 사항

- **이미지**: 기존 API 이미지 재사용 (`ghcr.io/skku-amang/amang-api:latest`)
- **시드 전략**: 환경별 다른 시드 데이터
  - staging: 테스트 데이터 (더미 사용자, 샘플 공연 등)
  - production: 필수 마스터 데이터만 (세션 타입, 기본 설정 등)
- **실행 시점**: 수동 실행 (`kubectl apply`)

## 디렉토리 구조

```
infra/k8s/db-jobs/
├── base/
│   ├── kustomization.yaml
│   ├── migrate-job.yaml
│   └── seed-job.yaml
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   └── secret.yaml
│   └── production/
│       ├── kustomization.yaml
│       ├── namespace.yaml
│       └── secret.yaml
```

## Job 설정

### 마이그레이션 Job

- 명령어: `npx prisma migrate deploy`
- `ttlSecondsAfterFinished: 300` (완료 후 5분 뒤 자동 정리)
- `backoffLimit: 3` (실패 시 3회 재시도)

### 시드 Job

- 명령어: `npx ts-node prisma/seed.ts`
- 환경변수 `SEED_TYPE`으로 분기
  - staging: `test`
  - production: `master`

## 시드 스크립트 수정

```typescript
// prisma/seed.ts
const seedType = process.env.SEED_TYPE || "test";

if (seedType === "master") {
  await seedMasterData(); // 세션 타입, 기본 설정 등
} else {
  await seedTestData(); // 더미 사용자, 샘플 공연 등
}
```

## 실행 명령어

```bash
# Staging 마이그레이션 + 시드
kubectl apply -k infra/k8s/db-jobs/overlays/staging

# Production 마이그레이션 + 시드
kubectl apply -k infra/k8s/db-jobs/overlays/production

# Job 상태 확인
kubectl get jobs -n amang-db-staging
kubectl logs job/db-migrate -n amang-db-staging
```
