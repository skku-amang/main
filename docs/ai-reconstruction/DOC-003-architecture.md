# DOC-003: 아키텍처 설계 문서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 프로젝트 구조를 정확하게 재현할 수 있도록 시스템 아키텍처, 디렉토리 구조, 네이밍 컨벤션을 상세 명세

---

## 1. 전체 시스템 아키텍처

### 1.1 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Turborepo Monorepo                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            apps/                                     │   │
│  │                                                                      │   │
│  │   ┌───────────────────────┐      ┌───────────────────────┐         │   │
│  │   │      apps/web         │      │       apps/api        │         │   │
│  │   │    (Next.js 14)       │      │     (NestJS 11)       │         │   │
│  │   │                       │      │                       │         │   │
│  │   │  - App Router         │      │  - REST API           │         │   │
│  │   │  - TanStack Query     │ HTTP │  - JWT Auth           │         │   │
│  │   │  - next-auth v5       │─────▶│  - Passport           │         │   │
│  │   │  - shadcn/ui          │      │  - Guards             │         │   │
│  │   │                       │      │                       │         │   │
│  │   │  Port: 3000           │      │  Port: 8000           │         │   │
│  │   └───────────┬───────────┘      └───────────┬───────────┘         │   │
│  │               │                              │                      │   │
│  └───────────────┼──────────────────────────────┼──────────────────────┘   │
│                  │                              │                          │
│  ┌───────────────┼──────────────────────────────┼──────────────────────┐   │
│  │               │         packages/            │                      │   │
│  │               │                              │                      │   │
│  │   ┌───────────▼───────────┐      ┌───────────▼───────────┐         │   │
│  │   │  @repo/api-client     │      │    @repo/database     │         │   │
│  │   │                       │      │      (Prisma)         │         │   │
│  │   │  - HTTP Client        │      │                       │         │   │
│  │   │  - Error Types        │      │  - schema.prisma      │         │   │
│  │   │  - Token Refresh      │      │  - Migrations         │         │   │
│  │   └───────────┬───────────┘      │  - Generated Client   │         │   │
│  │               │                  └───────────┬───────────┘         │   │
│  │               │                              │                      │   │
│  │   ┌───────────▼───────────────────────────────▼───────────┐         │   │
│  │   │              @repo/shared-types                       │         │   │
│  │   │                                                       │         │   │
│  │   │  - Zod Schemas (Validation)                          │         │   │
│  │   │  - TypeScript Types                                   │         │   │
│  │   │  - Prisma Select/Include Patterns                     │         │   │
│  │   └───────────────────────────────────────────────────────┘         │   │
│  │                                                                      │   │
│  │   ┌───────────────────────┐      ┌───────────────────────┐         │   │
│  │   │     @repo/ui          │      │ @repo/eslint-config   │         │   │
│  │   │  (Shared Components)  │      │ @repo/ts-config       │         │   │
│  │   └───────────────────────┘      └───────────────────────┘         │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                   │
│                                         ▼                                   │
│                              ┌──────────────────┐                          │
│                              │   PostgreSQL     │                          │
│                              │   Port: 5433     │                          │
│                              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 패키지 의존성 그래프

```
                    @repo/typescript-config (최상위, 의존성 없음)
                    @repo/eslint-config (최상위, 의존성 없음)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   apps/web             apps/api            packages/ui
        │                     │
        │     ┌───────────────┘
        │     │
        ▼     ▼
   @repo/api-client ────────────────────────┐
        │                                   │
        ▼                                   │
   @repo/shared-types ◀─────────────────────┤
        │                                   │
        ▼                                   ▼
   @repo/database ◀─────────────────── apps/api

의존성 방향:
- @repo/database: 기본 레이어 (Prisma만 의존)
- @repo/shared-types: database 의존 (Prisma 타입 사용)
- @repo/api-client: shared-types 의존 (타입 재사용)
- apps/web: api-client, shared-types, database 모두 의존
- apps/api: database, shared-types, api-client 의존
```

### 1.3 데이터 플로우

#### 읽기 요청 (Query)

```
1. Web: useTeam(teamId) 호출
   │
2. TanStack Query: queryFn 실행
   │
3. ApiClient.getTeamById(teamId)
   │
4. fetch(`${baseUrl}/teams/${teamId}`, { headers: { Authorization } })
   │
5. API Controller: @Get(':id')
   │
6. TeamService.findOne(id)
   │
7. PrismaService.team.findUnique({ where, include })
   │
8. PostgreSQL Query
   │
9. Prisma → TypeScript 객체 변환
   │
10. Response JSON
    │
11. ApiClient → 타입 캐스팅
    │
12. TanStack Query → 캐시 저장
    │
13. React 컴포넌트 렌더링
```

#### 쓰기 요청 (Mutation)

```
1. Web: createTeam(data) 호출
   │
2. useMutation: mutationFn 실행
   │
3. ApiClient.createTeam(data)
   │
4. fetch(POST, body: JSON.stringify(data))
   │
5. API Controller: @Post()
   │
6. ValidationPipe: Zod 스키마 검증
   │
7. TeamService.create(dto)
   │
8. Prisma Transaction: create + nested create
   │
9. PostgreSQL Transaction
   │
10. 성공/에러 응답
    │
11. onSuccess: queryClient.invalidateQueries(['teams'])
    │
12. 관련 쿼리 재요청
```

---

## 2. 디렉토리 구조

### 2.1 루트 레벨 구조

```
main/
├── apps/                          # 애플리케이션 (실행 가능)
│   ├── api/                       # NestJS 백엔드
│   └── web/                       # Next.js 프론트엔드
│
├── packages/                      # 공유 패키지 (라이브러리)
│   ├── database/                  # Prisma 스키마 및 클라이언트
│   ├── shared-types/              # Zod 스키마 + TypeScript 타입
│   ├── api-client/                # HTTP 클라이언트
│   ├── ui/                        # 공유 UI 컴포넌트
│   ├── eslint-config/             # ESLint 설정
│   └── typescript-config/         # TypeScript 설정
│
├── infra/                         # 인프라 설정
│   ├── k8s/                       # Kubernetes 설정
│   └── terraform/                 # Terraform 설정
│
├── docs/                          # 문서
│   └── ai-reconstruction/         # AI 재구성용 문서
│
├── package.json                   # 루트 패키지 설정
├── pnpm-workspace.yaml            # pnpm 워크스페이스 설정
├── turbo.json                     # Turborepo 설정
├── eslint.config.js               # 루트 ESLint 설정
├── .prettierrc                    # Prettier 설정
├── .gitignore                     # Git 무시 파일
└── CLAUDE.md                      # 프로젝트 가이드
```

### 2.2 apps/web 구조

```
apps/web/
├── app/                           # Next.js App Router
│   ├── (general)/                 # 일반 페이지 그룹
│   │   ├── (dark)/                # 어두운 테마 레이아웃
│   │   │   ├── layout.tsx         # headerMode="dark"
│   │   │   └── performances/
│   │   │       └── [id]/
│   │   │           └── teams/
│   │   │               ├── create/
│   │   │               │   └── page.tsx
│   │   │               └── [teamId]/
│   │   │                   ├── page.tsx
│   │   │                   └── edit/
│   │   │                       └── page.tsx
│   │   │
│   │   └── (light)/               # 밝은 테마 레이아웃
│   │       ├── layout.tsx         # headerMode="light"
│   │       ├── performances/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── teams/
│   │       │           └── page.tsx
│   │       ├── members/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── reservations/
│   │       │   ├── clubroom/
│   │       │   │   └── page.tsx
│   │       │   └── equipment/
│   │       │       └── page.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── signup/
│   │       │   └── page.tsx
│   │       └── notices/
│   │           └── page.tsx
│   │
│   ├── (home)/                    # 홈 페이지 그룹
│   │   ├── layout.tsx             # headerMode="transparent"
│   │   └── page.tsx               # 랜딩 페이지
│   │
│   ├── (errors)/                  # 에러 페이지
│   │   ├── Error.tsx
│   │   ├── Loading.tsx
│   │   └── NotFound.tsx
│   │
│   ├── login/                     # 로그인 페이지
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/                       # API 라우트
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts       # NextAuth 핸들러
│   │
│   ├── test/                      # 테스트/스토리북 페이지
│   │   ├── page.tsx
│   │   └── _components/
│   │
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── globals.css                # 전역 스타일
│   └── not-found.tsx              # 404 페이지
│
├── components/                    # 컴포넌트
│   ├── ui/                        # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── Header/                    # 내비게이션 헤더
│   │   ├── index.tsx
│   │   └── _component/
│   │       ├── MobileBackButton.tsx
│   │       ├── Profile.tsx
│   │       └── Sidebar/
│   │           ├── index.tsx
│   │           └── SheetInnerContent/
│   │
│   ├── PageHeaders/               # 페이지 상단 헤더
│   │   ├── Default/
│   │   │   ├── index.tsx
│   │   │   └── BreadCrumb.tsx
│   │   └── OleoPageHeader.tsx
│   │
│   ├── DataTable/                 # TanStack Table 래퍼
│   │   ├── index.tsx
│   │   ├── ColumnHeader.tsx
│   │   ├── Pagination.tsx
│   │   └── ViewOptions.tsx
│   │
│   ├── TeamBadges/                # 팀 관련 배지
│   │   ├── BasicTeamBadge.tsx
│   │   ├── SessionBadge.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── Form/                      # 폼 필드 컴포넌트
│   │   ├── SimpleLabel.tsx
│   │   ├── SimpleStringField.tsx
│   │   └── SimpleDateField.tsx
│   │
│   └── RootHeaderAndFooterWrapper.tsx
│
├── hooks/                         # 커스텀 훅
│   ├── api/                       # API 관련 훅
│   │   ├── usePerformance.ts
│   │   ├── useTeam.ts
│   │   ├── useUser.ts
│   │   ├── useSession.ts
│   │   ├── useGeneration.ts
│   │   ├── useEquipment.ts
│   │   ├── useRental.ts
│   │   └── mapper.ts              # 데이터 변환 함수
│   │
│   ├── useCustomQuery.ts          # 훅 팩토리
│   ├── useApiClient.ts            # ApiClient Context 훅
│   └── useTeamApplication.ts      # 팀 지원 상태 관리
│
├── lib/                           # 유틸리티
│   ├── providers/                 # React Context
│   │   ├── index.tsx              # 프로바이더 계층
│   │   ├── api-client-provider.tsx
│   │   ├── react-query-provider.tsx
│   │   └── session-guard.tsx
│   │
│   ├── auth/                      # 인증 유틸리티
│   ├── team/                      # 팀 유틸리티
│   ├── youtube/                   # YouTube 플레이어
│   ├── apiClient.ts               # ApiClient 인스턴스
│   └── utils.ts                   # 공통 유틸리티 (cn, etc.)
│
├── types/                         # TypeScript 타입
│   ├── auth.d.ts                  # next-auth 타입 확장
│   └── react-query.d.ts           # React Query 유틸리티 타입
│
├── constants/                     # 상수
│   └── routes.ts                  # 라우트 경로 상수
│
├── auth.ts                        # NextAuth 설정
├── middleware.ts                  # Next.js 미들웨어
├── next.config.mjs                # Next.js 설정
├── tailwind.config.ts             # Tailwind 설정
├── postcss.config.mjs             # PostCSS 설정
├── tsconfig.json                  # TypeScript 설정
└── package.json                   # 패키지 설정
```

### 2.3 apps/api 구조

```
apps/api/
├── src/
│   ├── main.ts                    # 진입점
│   ├── app.module.ts              # 루트 모듈
│   │
│   ├── auth/                      # 인증 모듈
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   ├── access-token.guard.ts
│   │   │   ├── refresh-token.guard.ts
│   │   │   ├── admin.guard.ts
│   │   │   ├── team-owner.guard.ts
│   │   │   └── rental-owner.guard.ts
│   │   ├── strategies/
│   │   │   ├── access-token.strategy.ts
│   │   │   └── refresh-token.strategy.ts
│   │   └── decorators/
│   │       └── public.decorator.ts
│   │
│   ├── users/                     # 사용자 모듈
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   ├── performance/               # 공연 모듈
│   │   ├── performance.module.ts
│   │   ├── performance.controller.ts
│   │   └── performance.service.ts
│   │
│   ├── team/                      # 팀 모듈
│   │   ├── team.module.ts
│   │   ├── team.controller.ts
│   │   └── team.service.ts
│   │
│   ├── session/                   # 세션 모듈
│   │   ├── session.module.ts
│   │   ├── session.controller.ts
│   │   └── session.service.ts
│   │
│   ├── generation/                # 기수 모듈
│   │   ├── generation.module.ts
│   │   ├── generation.controller.ts
│   │   └── generation.service.ts
│   │
│   ├── equipment/                 # 장비 모듈
│   │   ├── equipment.module.ts
│   │   ├── equipment.controller.ts
│   │   └── equipment.service.ts
│   │
│   ├── rental/                    # 대여 모듈
│   │   ├── rental.module.ts
│   │   ├── rental.controller.ts
│   │   └── rental.service.ts
│   │
│   ├── prisma/                    # Prisma 모듈
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── common/                    # 공통 유틸리티
│       ├── filters/               # 예외 필터
│       ├── pipes/                 # 파이프
│       └── interceptors/          # 인터셉터
│
├── test/                          # E2E 테스트
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── nest-cli.json                  # NestJS CLI 설정
├── tsconfig.json                  # TypeScript 설정
├── tsconfig.build.json            # 빌드용 TypeScript 설정
└── package.json                   # 패키지 설정
```

### 2.4 packages/database 구조

```
packages/database/
├── prisma/
│   ├── schema.prisma              # 스키마 정의 (Single Source of Truth)
│   ├── migrations/                # 마이그레이션 히스토리
│   │   ├── 20250706162100_init_user_model/
│   │   ├── 20250712095520_implement_generation_model/
│   │   ├── 20250725075004_add_session_model/
│   │   ├── 20250826062353_implement_team_model/
│   │   └── ... (11개)
│   └── seed.ts                    # 시드 데이터
│
├── generated/                     # Prisma 클라이언트 생성 위치
│   └── prisma/
│
├── src/
│   └── index.ts                   # PrismaClient export
│
├── .env                           # 환경변수 (DATABASE_URL)
├── tsconfig.json
└── package.json
```

### 2.5 packages/shared-types 구조

```
packages/shared-types/
├── src/
│   ├── index.ts                   # 전체 export
│   ├── models.type.ts             # 기본 타입 정의
│   │
│   ├── auth/
│   │   ├── index.ts
│   │   ├── login.schema.ts        # 로그인 Zod 스키마
│   │   ├── register.schema.ts     # 회원가입 Zod 스키마
│   │   └── token.types.ts         # 토큰 타입
│   │
│   ├── user/
│   │   ├── index.ts
│   │   ├── user.types.ts          # User 타입, Selector
│   │   ├── create-user.schema.ts
│   │   └── update-user.schema.ts
│   │
│   ├── team/
│   │   ├── index.ts
│   │   ├── team.types.ts          # Team 타입, Selector
│   │   ├── create-team.schema.ts
│   │   ├── update-team.schema.ts
│   │   └── team-application.schema.ts
│   │
│   ├── performance/
│   │   ├── index.ts
│   │   ├── performance.types.ts
│   │   ├── create-performance.schema.ts
│   │   └── update-performance.schema.ts
│   │
│   ├── session/
│   │   ├── index.ts
│   │   ├── session.types.ts
│   │   └── session.schema.ts
│   │
│   ├── generation/
│   │   ├── index.ts
│   │   ├── generation.types.ts
│   │   └── generation.schema.ts
│   │
│   ├── equipment/
│   │   ├── index.ts
│   │   ├── equipment.types.ts
│   │   └── equipment.schema.ts
│   │
│   ├── rental/
│   │   ├── index.ts
│   │   ├── rental.types.ts
│   │   └── rental.schema.ts
│   │
│   └── constants/
│       ├── index.ts
│       └── enums.ts               # SessionName, EquipCategory 등
│
├── tsconfig.json
└── package.json
```

### 2.6 packages/api-client 구조

```
packages/api-client/
├── src/
│   ├── index.ts                   # ApiClient 클래스 (메인)
│   ├── errors.ts                  # 에러 클래스 정의
│   └── api-result.ts              # ApiResult 타입
│
├── tsconfig.json
└── package.json
```

---

## 3. 네이밍 컨벤션

### 3.1 파일명 컨벤션

| 유형                | 패턴                      | 예시                               |
| ------------------- | ------------------------- | ---------------------------------- |
| **React 컴포넌트**  | PascalCase.tsx            | `TeamForm.tsx`, `SessionBadge.tsx` |
| **React 훅**        | camelCase.ts (use prefix) | `useTeam.ts`, `useApiClient.ts`    |
| **유틸리티 함수**   | camelCase.ts              | `formatDate.ts`, `utils.ts`        |
| **상수**            | camelCase.ts              | `routes.ts`, `config.ts`           |
| **타입 정의**       | kebab-case.ts             | `team.types.ts`, `api-result.ts`   |
| **Zod 스키마**      | kebab-case.schema.ts      | `create-team.schema.ts`            |
| **NestJS 컨트롤러** | kebab-case.controller.ts  | `team.controller.ts`               |
| **NestJS 서비스**   | kebab-case.service.ts     | `team.service.ts`                  |
| **NestJS 모듈**     | kebab-case.module.ts      | `team.module.ts`                   |
| **NestJS 가드**     | kebab-case.guard.ts       | `access-token.guard.ts`            |
| **테스트 파일**     | _.spec.ts / _.e2e-spec.ts | `team.service.spec.ts`             |

### 3.2 변수/함수 네이밍

| 유형                | 패턴                   | 예시                           |
| ------------------- | ---------------------- | ------------------------------ |
| **상수**            | SCREAMING_SNAKE_CASE   | `SESSION_NAME`, `API_BASE_URL` |
| **함수**            | camelCase              | `createTeam`, `formatDate`     |
| **클래스**          | PascalCase             | `TeamService`, `ApiClient`     |
| **인터페이스/타입** | PascalCase             | `TeamDetail`, `CreateTeamDto`  |
| **Zod 스키마**      | PascalCase + Schema    | `CreateTeamSchema`             |
| **Enum**            | PascalCase             | `SessionName`, `EquipCategory` |
| **Enum 값**         | SCREAMING_SNAKE_CASE   | `VOCAL`, `AUDIO_INTERFACE`     |
| **React 컴포넌트**  | PascalCase             | `TeamForm`, `SessionBadge`     |
| **React 훅**        | camelCase (use prefix) | `useTeam`, `useApiClient`      |
| **Query Key**       | 배열 형태              | `['team', teamId]`             |

### 3.3 디렉토리 네이밍

| 유형                    | 패턴              | 예시                         |
| ----------------------- | ----------------- | ---------------------------- |
| **일반 디렉토리**       | kebab-case        | `shared-types`, `api-client` |
| **NestJS 모듈**         | kebab-case (단수) | `team/`, `performance/`      |
| **Next.js 라우트**      | kebab-case        | `reservations/clubroom/`     |
| **Next.js 라우트 그룹** | (kebab-case)      | `(general)`, `(dark)`        |
| **Next.js 동적 라우트** | [param]           | `[id]`, `[teamId]`           |
| **컴포넌트 디렉토리**   | PascalCase        | `Header/`, `DataTable/`      |
| **private 컴포넌트**    | \_component/      | `Header/_component/`         |

### 3.4 API 엔드포인트 네이밍

```
기본 규칙: RESTful, 복수형 명사

GET    /performances              # 목록 조회
GET    /performances/:id          # 상세 조회
POST   /performances              # 생성
PATCH  /performances/:id          # 수정
DELETE /performances/:id          # 삭제

# 하위 리소스
GET    /performances/:id/teams    # 공연의 팀 목록

# 동작 (Action)
PATCH  /teams/:id/apply           # 팀 지원
PATCH  /teams/:id/unapply         # 팀 지원 취소
```

### 3.5 데이터베이스 네이밍 (Prisma)

| 유형          | 패턴              | 예시                           |
| ------------- | ----------------- | ------------------------------ |
| **모델명**    | PascalCase (단수) | `User`, `TeamSession`          |
| **필드명**    | camelCase         | `createdAt`, `performanceId`   |
| **관계 필드** | camelCase         | `team`, `members`              |
| **FK 필드**   | camelCase + Id    | `teamId`, `userId`             |
| **Enum**      | PascalCase        | `SessionName`, `EquipCategory` |

---

## 4. 모듈 Export 패턴

### 4.1 packages/database

```typescript
// packages/database/src/index.ts
export { PrismaClient, Prisma } from "../generated/prisma";
export * from "../generated/prisma";
```

### 4.2 packages/shared-types

```typescript
// packages/shared-types/src/index.ts

// 타입 export
export * from "./user";
export * from "./team";
export * from "./performance";
export * from "./session";
export * from "./generation";
export * from "./equipment";
export * from "./rental";
export * from "./auth";
export * from "./constants";
```

### 4.3 packages/api-client

```typescript
// packages/api-client/src/index.ts
export { ApiClient } from "./client";
export * from "./errors";
export * from "./api-result";
```

---

## 5. Import 경로 패턴

### 5.1 apps/web에서의 import

```typescript
// 내부 패키지 import
import { ApiClient } from "@repo/api-client";
import { CreateTeamSchema, type TeamDetail } from "@repo/shared-types";
import { PrismaClient } from "@repo/database";

// 로컬 모듈 import (path alias: @/*)
import { useTeam } from "@/hooks/api/useTeam";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
```

### 5.2 apps/api에서의 import

```typescript
// 내부 패키지 import
import { PrismaClient } from "@repo/database";
import { CreateTeamSchema, CreateTeamDto } from "@repo/shared-types";

// NestJS 모듈 import
import { Controller, Get, Post } from "@nestjs/common";

// 로컬 모듈 import (상대 경로)
import { TeamService } from "./team.service";
import { PrismaService } from "../prisma/prisma.service";
```

---

## 6. 빌드 순서 및 의존성

### 6.1 Turborepo 빌드 그래프

```
빌드 순서 (의존성 기반):

1단계: 의존성 없는 패키지
   └── @repo/typescript-config
   └── @repo/eslint-config

2단계: database (prisma generate)
   └── @repo/database

3단계: shared-types (database 의존)
   └── @repo/shared-types

4단계: api-client, ui (shared-types 의존)
   ├── @repo/api-client
   └── @repo/ui

5단계: 애플리케이션
   ├── apps/api
   └── apps/web
```

### 6.2 개발 서버 시작 순서

```
pnpm dev 실행 시:

1. turbo run dev
2. ^db:generate 의존성 해결
3. packages/database: prisma generate
4. 병렬 실행:
   - apps/api: nest start --watch (port 8000)
   - apps/web: next dev (port 3000)
```

---

## 7. 환경변수 관리

### 7.1 환경변수 위치

| 파일         | 위치               | 용도                        |
| ------------ | ------------------ | --------------------------- |
| `.env`       | packages/database/ | DATABASE_URL                |
| `.env.local` | apps/web/          | NEXT*PUBLIC*\*, AUTH_SECRET |
| `.env`       | apps/api/          | JWT_SECRET, DATABASE_URL    |

### 7.2 Turborepo globalEnv

```json
// turbo.json
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

### 7.3 환경변수 목록

| 변수명                     | 앱            | 설명                     | 예시                                       |
| -------------------------- | ------------- | ------------------------ | ------------------------------------------ |
| `DATABASE_URL`             | api, database | PostgreSQL 연결          | `postgresql://user:pass@localhost:5433/db` |
| `NEXT_PUBLIC_API_URL`      | web           | API 서버 URL             | `http://localhost:8000`                    |
| `AUTH_SECRET`              | web           | NextAuth 시크릿          | 랜덤 문자열                                |
| `ACCESS_TOKEN_SECRET`      | api           | JWT 액세스 토큰 시크릿   | 랜덤 문자열                                |
| `ACCESS_TOKEN_EXPIRES_IN`  | api           | 액세스 토큰 만료 시간    | `3600` (초)                                |
| `REFRESH_TOKEN_SECRET`     | api           | JWT 리프레시 토큰 시크릿 | 랜덤 문자열                                |
| `REFRESH_TOKEN_EXPIRES_IN` | api           | 리프레시 토큰 만료 시간  | `604800` (초)                              |

---

## 8. 참조 문서

| 문서 ID | 문서명         | 관계           |
| ------- | -------------- | -------------- |
| DOC-001 | 프로젝트 개요  | 요구사항 기반  |
| DOC-002 | 기술 스택 결정 | 기술 선택 근거 |
| DOC-004 | 도메인 모델    | 엔티티 상세    |
| DOC-005 | DB 스키마      | Prisma 스키마  |
| DOC-013 | 개발 환경 설정 | 환경 구성      |
