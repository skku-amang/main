# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AMANG - 성균관대학교 밴드 동아리 관리 시스템. 공연(Performance), 팀(Team), 세션(Session), 장비(Equipment) 관리 및 예약 기능 제공.

## Commands

```bash
# 개발 서버 실행 (모든 앱)
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=web    # Next.js 웹 앱 (포트 3000)
pnpm dev --filter=api    # NestJS API 서버 (포트 8000)

# 빌드
pnpm build
pnpm build --filter=web

# 린트 및 포맷
pnpm lint
pnpm format

# 타입 체크
pnpm check-types

# API 테스트
cd apps/api && pnpm test           # 단위 테스트
cd apps/api && pnpm test:watch     # 감시 모드
cd apps/api && pnpm test:e2e       # E2E 테스트

# 데이터베이스
pnpm db:deploy                     # 마이그레이션 배포
cd packages/database && pnpm db:migrate   # 개발 마이그레이션
cd packages/database && pnpm db:seed      # 시드 데이터
cd packages/database && pnpm db:generate  # Prisma 클라이언트 생성
```

## Architecture

### Monorepo Structure (Turborepo + pnpm)

**Apps:**

- `apps/web` - Next.js 16 프론트엔드 (App Router, Turbopack, next-auth v5, TanStack Query)
- `apps/api` - NestJS 백엔드 (JWT 인증, Prisma ORM)

**Packages:**

- `@repo/database` - Prisma 스키마 및 클라이언트
- `@repo/shared-types` - Zod 스키마 및 TypeScript 타입 (프론트/백엔드 공유)
- `@repo/api-client` - API 클라이언트 클래스 (에러 타입 포함)

### Data Flow

```
Web (React Query) → ApiClient (@repo/api-client) → API (NestJS) → Prisma → PostgreSQL
```

### Key Patterns

**API Hooks (apps/web/hooks/api/):**

```typescript
// createQueryHook/createMutationHook으로 타입 안전한 훅 생성
export const useTeam = createQueryHook(
  ApiClient.prototype.getTeamById,
  (teamId: number) => ["team", teamId],
);
```

**인증:**

- next-auth v5 Credentials provider (`apps/web/auth.ts`)
- JWT access/refresh 토큰 방식
- ApiClient가 토큰 만료 시 자동 갱신 처리

**라우트 그룹:**

- `(general)/(dark)` - 어두운 테마 페이지 (팀 상세 등)
- `(general)/(light)` - 밝은 테마 페이지 (목록, 관리 등)
- `(home)` - 랜딩 페이지

### Domain Models

- **Performance** - 공연 (여러 Team 포함)
- **Team** - 밴드 팀 (곡 정보, TeamSession 목록)
- **TeamSession** - 팀 내 세션 (capacity, TeamMember 목록)
- **Session** - 악기 세션 (VOCAL, GUITAR, BASS, SYNTH, DRUM 등)
- **User** - 사용자 (Generation 소속, 여러 Session 가능)
- **Equipment** - 장비 및 동아리방 예약

### Environment Variables

- `DATABASE_URL` - PostgreSQL 연결 문자열
- `NEXT_PUBLIC_API_URL` - API 서버 URL (기본: <http://localhost:8000>)

### MCP 사용 규칙

- Notion: `amang-notion` MCP 사용 (`plugin:Notion` 아님)
- Figma: `amang-figma` MCP 사용 (`plugin:figma` 아님)
