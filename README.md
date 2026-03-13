# AMANG

성균관대학교 밴드 동아리 **AMANG**의 공연 관리 시스템입니다.

공연(Performance), 팀(Team), 세션(Session), 장비(Equipment) 관리 및 예약 기능을 제공합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TailwindCSS, Radix UI, TanStack Query, next-auth v5 |
| **Backend** | NestJS 11, Passport (JWT), Prisma ORM |
| **Database** | PostgreSQL 15 |
| **Storage** | MinIO (S3 호환) |
| **Infra** | Turborepo, pnpm, Docker Compose, Storybook |

## 프로젝트 구조

```
apps/
├── web/          # Next.js 프론트엔드 (포트 3000)
└── api/          # NestJS 백엔드 (포트 8000)

packages/
├── database/     # Prisma 스키마 및 클라이언트
├── shared-types/ # Zod 스키마 · TypeScript 타입 (프론트/백엔드 공유)
├── api-client/   # API 클라이언트 클래스
├── ui/           # 공유 UI 컴포넌트
├── eslint-config/
└── typescript-config/
```

## 시작하기

### 사전 요구사항

- **Node.js** >= 20.9.0
- **pnpm** 10.x (`corepack enable`로 활성화)
- **Docker** (PostgreSQL, MinIO 실행용)

### 1. 클론 및 의존성 설치

```bash
git clone https://github.com/skku-amang/main.git
cd main
pnpm install
```

### 2. 환경변수 설정

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

기본값이 로컬 개발에 맞게 설정되어 있으므로 그대로 사용해도 됩니다.

### 3. DB 및 스토리지 실행

```bash
cd apps/api
docker compose up -d
```

PostgreSQL(포트 5433)과 MinIO(포트 9000/9001)가 실행됩니다.

### 4. 데이터베이스 마이그레이션 및 시드

```bash
# 프로젝트 루트에서
pnpm db:deploy                          # 마이그레이션 적용
cd packages/database && pnpm db:seed    # 시드 데이터 삽입
```

### 5. 개발 서버 실행

```bash
# 프로젝트 루트에서
pnpm dev
```

- 웹: http://localhost:3000
- API: http://localhost:8000

## 자주 쓰는 명령어

```bash
pnpm dev                              # 모든 앱 개발 서버
pnpm dev --filter=web                 # 웹만 실행
pnpm dev --filter=api                 # API만 실행
pnpm build                            # 전체 빌드
pnpm lint                             # ESLint
pnpm format                           # Prettier 체크
pnpm check-types                      # 타입 체크

# 데이터베이스
cd packages/database
pnpm db:migrate                       # 개발 마이그레이션 생성
pnpm db:generate                      # Prisma 클라이언트 재생성
pnpm db:seed                          # 시드 데이터

# 테스트
cd apps/api && pnpm test              # 단위 테스트
cd apps/api && pnpm test:e2e          # E2E 테스트

# Storybook
cd apps/web && pnpm storybook         # 포트 6006
```

## 도메인 모델

```
Performance (공연)
└── Team (밴드 팀)
    ├── Song (곡 정보)
    └── TeamSession (세션 슬롯)
        ├── Session (악기: VOCAL, GUITAR, BASS, SYNTH, DRUM 등)
        └── TeamMember (참여자)

User (사용자)
├── Generation (기수)
└── Sessions (연주 가능한 세션들)

Equipment (장비/동아리방 예약)
```

## 데이터 흐름

```
Web (TanStack Query) → ApiClient (@repo/api-client) → API (NestJS) → Prisma → PostgreSQL
```

- **인증**: next-auth v5 → JWT access/refresh 토큰 → ApiClient가 토큰 자동 갱신
- **타입 안전성**: `@repo/shared-types`의 Zod 스키마를 프론트/백엔드에서 공유
