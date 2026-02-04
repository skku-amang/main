# DOC-015: 배포 및 CI/CD 문서

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트는 다음과 같은 배포 전략을 사용합니다:

| 앱            | 배포 플랫폼          | 방식           |
| ------------- | -------------------- | -------------- |
| Web (Next.js) | Vercel               | 자동 배포      |
| API (NestJS)  | Docker + Self-hosted | GitHub Actions |

---

## 2. CI/CD 파이프라인

### 2.1 전체 흐름

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Git Push / PR                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────┐
         │    CI Workflow   │           │  Build Image     │
         │   (모든 PR/Push) │           │  (main만)        │
         └──────────────────┘           └──────────────────┘
                    │                               │
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────┐
         │ • Lint           │           │ • Docker Build   │
         │ • Type Check     │           │ • Push to GHCR   │
         │ • Format Check   │           │                  │
         │ • Test           │           │                  │
         └──────────────────┘           └──────────────────┘
                                                    │
                    ┌───────────────────────────────┘
                    │
                    ▼
         ┌──────────────────┐           ┌──────────────────┐
         │   Vercel         │           │   Self-hosted    │
         │   (Web 자동배포)  │           │   (API 수동배포)  │
         └──────────────────┘           └──────────────────┘
```

---

## 3. GitHub Actions Workflows

### 3.1 CI Workflow

**파일**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Generate Prisma Client
        run: pnpm turbo db:generate

      - name: Run Lint & Type Check
        run: pnpm turbo lint check-types

      - name: Check Format
        run: pnpm turbo format

      - name: Run Tests
        run: pnpm turbo test
```

#### 트리거 조건

- `main` 브랜치로 Push
- 모든 Pull Request

#### 실행 단계

1. pnpm 설치
2. Node.js 22 설정 (캐시 포함)
3. 의존성 설치
4. Prisma 클라이언트 생성
5. Lint 및 타입 체크
6. 포맷 검사
7. 테스트 실행

### 3.2 Docker Image Build Workflow

**파일**: `.github/workflows/build-image.yml`

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    strategy:
      fail-fast: false
      matrix:
        app:
          - name: api
            dockerfile: apps/api/Dockerfile
            build-args: ""

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push ${{ matrix.app.name }} image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ${{ matrix.app.dockerfile }}
          platforms: linux/amd64
          push: true
          tags: |
            ghcr.io/skku-amang/amang-${{ matrix.app.name }}:${{ github.sha }}
            ghcr.io/skku-amang/amang-${{ matrix.app.name }}:latest
          build-args: ${{ matrix.app.build-args }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

#### 트리거 조건

- `main` 브랜치로 Push
- 수동 트리거 (workflow_dispatch)

#### 이미지 태그

- `ghcr.io/skku-amang/amang-api:latest`
- `ghcr.io/skku-amang/amang-api:<commit-sha>`

---

## 4. Docker 설정

### 4.1 API Dockerfile

**파일**: `apps/api/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm turbo@^2

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

# Turborepo prune으로 필요한 패키지만 추출
RUN turbo prune api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run db:generate --filter=@repo/database
RUN pnpm turbo run build --filter=api

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app .

ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "apps/api/dist/main.js"]
```

### 4.2 Web Dockerfile

**파일**: `apps/web/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm turbo@^2

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

RUN turbo prune web --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 빌드 타임 환경변수
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=web

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Next.js standalone 출력 복사
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### 4.3 Docker 빌드 전략

```
┌────────────────────────────────────────────────────────────────┐
│                    Multi-stage Build                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1: base                                                  │
│  ├── node:22-alpine                                            │
│  └── pnpm, turbo 설치                                          │
│                                                                 │
│  Stage 2: builder                                               │
│  ├── 전체 소스 복사                                             │
│  └── turbo prune으로 필요한 패키지만 추출                        │
│                                                                 │
│  Stage 3: installer                                             │
│  ├── 추출된 패키지 설치                                         │
│  ├── Prisma 클라이언트 생성                                     │
│  └── 빌드 실행                                                  │
│                                                                 │
│  Stage 4: runner                                                │
│  ├── 최소 런타임 환경                                           │
│  ├── non-root 사용자 실행                                       │
│  └── 프로덕션 실행                                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Vercel 배포 (Web)

### 5.1 자동 배포 설정

Vercel은 GitHub 저장소와 연결되어 자동으로 배포됩니다:

- **Production**: `main` 브랜치 Push 시
- **Preview**: PR 생성 시

### 5.2 Vercel 환경 변수

| 변수명                | 값                      | 환경                |
| --------------------- | ----------------------- | ------------------- |
| `AUTH_SECRET`         | (secret)                | Production, Preview |
| `NEXT_PUBLIC_API_URL` | https://api.example.com | Production          |
| `DATABASE_URL`        | (secret)                | Production          |

### 5.3 Build 설정

```
Framework: Next.js
Build Command: pnpm turbo build --filter=web
Output Directory: apps/web/.next
Install Command: pnpm install
Root Directory: ./
```

---

## 6. API 서버 배포

### 6.1 Docker Compose 예시

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    image: ghcr.io/skku-amang/amang-api:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/amang
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=amang
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 6.2 수동 배포 절차

```bash
# 1. 최신 이미지 Pull
docker pull ghcr.io/skku-amang/amang-api:latest

# 2. 기존 컨테이너 중지 및 제거
docker stop amang-api
docker rm amang-api

# 3. 새 컨테이너 실행
docker run -d \
  --name amang-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_ACCESS_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  ghcr.io/skku-amang/amang-api:latest

# 4. 마이그레이션 실행 (필요시)
docker exec amang-api npx prisma migrate deploy
```

---

## 7. 환경별 설정

### 7.1 개발 환경

| 항목     | 값                    |
| -------- | --------------------- |
| Web URL  | http://localhost:3000 |
| API URL  | http://localhost:8000 |
| Database | 로컬 PostgreSQL       |

### 7.2 프로덕션 환경

| 항목     | 값                                |
| -------- | --------------------------------- |
| Web URL  | https://amang.vercel.app          |
| API URL  | https://amang-api.json-server.win |
| Database | 클라우드 PostgreSQL               |

---

## 8. 데이터베이스 마이그레이션

### 8.1 프로덕션 마이그레이션

```bash
# 로컬에서 마이그레이션 파일 생성
cd packages/database
pnpm db:migrate

# 프로덕션에 배포
pnpm db:deploy
```

### 8.2 CI에서 자동 마이그레이션

프로덕션 배포 시 마이그레이션은 수동으로 실행하는 것을 권장합니다.

---

## 9. 모니터링 및 로깅

### 9.1 컨테이너 로그

```bash
# 실시간 로그 확인
docker logs -f amang-api

# 최근 100줄
docker logs --tail 100 amang-api
```

### 9.2 헬스 체크

```bash
# API 서버 상태 확인
curl http://localhost:8000/health
```

---

## 10. 롤백 절차

### 10.1 이전 버전으로 롤백

```bash
# 특정 커밋 SHA의 이미지로 롤백
docker pull ghcr.io/skku-amang/amang-api:<commit-sha>
docker stop amang-api
docker rm amang-api
docker run -d \
  --name amang-api \
  ... \
  ghcr.io/skku-amang/amang-api:<commit-sha>
```

### 10.2 Vercel 롤백

Vercel 대시보드에서 이전 배포를 선택하여 "Promote to Production" 클릭

---

## 11. AI 구현 체크리스트

### 11.1 CI 설정

- [ ] `.github/workflows/ci.yml` 파일 생성
- [ ] pnpm 및 Node.js 버전 설정
- [ ] lint, type-check, format, test 단계 포함

### 11.2 Docker 설정

- [ ] Multi-stage Dockerfile 작성
- [ ] turbo prune으로 필요한 패키지만 포함
- [ ] non-root 사용자로 실행

### 11.3 Vercel 설정

- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정
- [ ] Build 명령어 설정

### 11.4 프로덕션 배포

- [ ] 환경 변수 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 헬스 체크 확인

---

## 12. 관련 파일 목록

| 파일 경로                           | 역할                   |
| ----------------------------------- | ---------------------- |
| `.github/workflows/ci.yml`          | CI 워크플로우          |
| `.github/workflows/build-image.yml` | Docker 빌드 워크플로우 |
| `apps/api/Dockerfile`               | API 서버 Docker 이미지 |
| `apps/web/Dockerfile`               | Web 앱 Docker 이미지   |
| `turbo.json`                        | Turborepo 빌드 설정    |
