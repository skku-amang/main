# DOC-013: 개발 환경 설정 가이드

> AI 재구성을 위한 상세 명세

---

## 1. 필수 요구사항

### 1.1 시스템 요구사항

| 도구       | 버전    | 비고             |
| ---------- | ------- | ---------------- |
| Node.js    | ≥ 18    | LTS 권장         |
| pnpm       | 10.13.1 | 정확한 버전 필요 |
| PostgreSQL | ≥ 14    | Docker 사용 가능 |
| Git        | ≥ 2.x   | -                |

### 1.2 권장 IDE/에디터

- VS Code + 확장:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma

---

## 2. 프로젝트 설정

### 2.1 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd main

# pnpm 설치 (없는 경우)
npm install -g pnpm@10.13.1

# 의존성 설치
pnpm install
```

### 2.2 pnpm workspace 구조

**파일**: `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 3. 환경 변수 설정

### 3.1 필수 환경 변수

| 변수명                  | 위치                     | 설명                      | 예시                                          |
| ----------------------- | ------------------------ | ------------------------- | --------------------------------------------- |
| `DATABASE_URL`          | `packages/database/.env` | PostgreSQL 연결 문자열    | `postgresql://user:pass@localhost:5432/amang` |
| `AUTH_SECRET`           | `apps/web/.env.local`    | next-auth 암호화 키       | 32자 이상 랜덤 문자열                         |
| `NEXT_PUBLIC_API_URL`   | `apps/web/.env.local`    | API 서버 URL              | `http://localhost:8000`                       |
| `JWT_ACCESS_SECRET`     | `apps/api/.env`          | JWT 액세스 토큰 비밀키    | 랜덤 문자열                                   |
| `JWT_REFRESH_SECRET`    | `apps/api/.env`          | JWT 리프레시 토큰 비밀키  | 랜덤 문자열                                   |
| `SEED_DEFAULT_PASSWORD` | `packages/database/.env` | 시드 사용자 기본 비밀번호 | 개발용 비밀번호                               |

### 3.2 환경 변수 파일 생성

```bash
# packages/database/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amang?schema=public"
SEED_DEFAULT_PASSWORD="password123!"

# apps/web/.env.local
AUTH_SECRET="your-auth-secret-key-at-least-32-characters-long"
NEXT_PUBLIC_API_URL="http://localhost:8000"

# apps/api/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amang?schema=public"
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
```

### 3.3 Turbo 전역 환경 변수

**파일**: `turbo.json`

```json
{
  "globalEnv": [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_API_URL"
  ]
}
```

---

## 4. 데이터베이스 설정

### 4.1 Docker로 PostgreSQL 실행

```bash
# PostgreSQL 컨테이너 실행
docker run --name amang-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=amang \
  -p 5432:5432 \
  -d postgres:14
```

### 4.2 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
cd packages/database && pnpm db:generate

# 개발 마이그레이션 실행
cd packages/database && pnpm db:migrate

# 또는 프로덕션 마이그레이션 배포
pnpm db:deploy
```

### 4.3 시드 데이터 생성

```bash
cd packages/database && pnpm db:seed
```

시드 데이터 실행 순서:

1. Sessions (악기 세션)
2. Generations (기수)
3. Users (사용자)
4. Performances (공연)
5. Teams (팀)
6. Equipment (장비)
7. EquipmentRentals (예약)

### 4.4 데이터베이스 초기화

```bash
# 데이터 리셋 후 재시드
cd packages/database && pnpm db:reset
```

---

## 5. 개발 서버 실행

### 5.1 전체 앱 실행

```bash
# 루트에서 모든 앱 동시 실행
pnpm dev
```

### 5.2 개별 앱 실행

```bash
# Next.js 웹 앱만 실행 (포트 3000)
pnpm dev --filter=web

# NestJS API 서버만 실행 (포트 8000)
pnpm dev --filter=api
```

### 5.3 개발 서버 URL

| 앱  | URL                   | 비고    |
| --- | --------------------- | ------- |
| Web | http://localhost:3000 | Next.js |
| API | http://localhost:8000 | NestJS  |

---

## 6. 빌드 및 검증

### 6.1 빌드

```bash
# 전체 빌드
pnpm build

# 특정 앱만 빌드
pnpm build --filter=web
pnpm build --filter=api
```

### 6.2 타입 체크

```bash
pnpm check-types
```

### 6.3 린트

```bash
pnpm lint
```

### 6.4 포맷 검사

```bash
pnpm format
```

---

## 7. 프로젝트 스크립트

### 7.1 루트 스크립트

**파일**: `package.json`

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "format": "turbo format",
    "check-types": "turbo check-types",
    "db:deploy": "turbo db:deploy",
    "prepare": "husky"
  }
}
```

### 7.2 apps/web 스크립트

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "eslint ... --fix",
    "format": "prettier --check ..."
  }
}
```

### 7.3 apps/api 스크립트

```json
{
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "check-types": "tsc --noEmit"
  }
}
```

### 7.4 packages/database 스크립트

```json
{
  "scripts": {
    "build": "prisma generate && tsc",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev --skip-generate",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset --force --skip-generate && pnpm db:seed"
  }
}
```

---

## 8. Turbo 태스크 의존성

**파일**: `turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true
    },
    "db:seed": {
      "dependsOn": ["^db:generate", "^db:migrate"]
    }
  }
}
```

### 8.1 의존성 그래프

```
dev 실행 시:
  1. packages/database: db:generate (Prisma 클라이언트 생성)
  2. apps/web: dev (Next.js 개발 서버)
  3. apps/api: dev (NestJS 개발 서버)

build 실행 시:
  1. packages/database: db:generate → build
  2. packages/shared-types: build
  3. packages/api-client: build
  4. apps/web: build
  5. apps/api: build
```

---

## 9. Git 훅 (Husky)

### 9.1 pre-commit 훅

```bash
# lint-staged 실행
pnpm lint-staged
```

### 9.2 lint-staged 설정

**파일**: `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": "eslint --fix",
    "*.{js,jsx,ts,tsx,json,css,md}": "prettier --check"
  }
}
```

---

## 10. 패키지 의존성 관계

```
packages/database
    │
    ├── @prisma/client
    │
    └───────────────────┐
                        │
packages/shared-types   │
    │                   │
    ├── zod             │
    │                   │
    └────┬──────────────┤
         │              │
packages/api-client     │
    │                   │
    ├── shared-types ───┤
    │                   │
    └─────┬─────────────┤
          │             │
    ┌─────┴─────┐       │
    │           │       │
apps/web    apps/api    │
    │           │       │
    └─────┬─────┘       │
          │             │
          └─────────────┘
              database
```

---

## 11. 트러블슈팅

### 11.1 Prisma 클라이언트 오류

```bash
# 캐시 제거 후 재생성
rm -rf node_modules/.prisma
cd packages/database && pnpm db:generate
```

### 11.2 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

### 11.3 pnpm 버전 불일치

```bash
# 정확한 버전 설치
npm install -g pnpm@10.13.1

# 버전 확인
pnpm --version
```

### 11.4 TypeScript 타입 오류

```bash
# 전체 타입 체크
pnpm check-types

# 빌드 후 타입 체크
pnpm build && pnpm check-types
```

---

## 12. AI 구현 체크리스트

### 12.1 초기 설정

- [ ] Node.js ≥ 18 설치
- [ ] pnpm 10.13.1 설치
- [ ] PostgreSQL 실행 (Docker 또는 로컬)
- [ ] 환경 변수 파일 생성

### 12.2 데이터베이스 설정

- [ ] `DATABASE_URL` 설정
- [ ] `pnpm db:generate` 실행
- [ ] `pnpm db:migrate` 실행
- [ ] `pnpm db:seed` 실행

### 12.3 개발 서버 실행

- [ ] `pnpm install` 완료
- [ ] `pnpm dev` 실행
- [ ] http://localhost:3000 접속 확인
- [ ] http://localhost:8000 접속 확인

---

## 13. 관련 파일 목록

| 파일 경로                | 역할                  |
| ------------------------ | --------------------- |
| `package.json`           | 루트 패키지 설정      |
| `pnpm-workspace.yaml`    | 워크스페이스 설정     |
| `turbo.json`             | Turborepo 태스크 설정 |
| `packages/database/.env` | DB 환경 변수          |
| `apps/web/.env.local`    | 웹 앱 환경 변수       |
| `apps/api/.env`          | API 환경 변수         |
