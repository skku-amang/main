# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AMANG - 성균관대학교 밴드 동아리 관리 시스템. 공연(Performance), 팀(Team), 세션(Session), 장비(Equipment) 관리 및 예약 기능 제공.

## Conventions

- **이슈, 브랜치, PR, 커밋**: [CONTRIBUTING.md](CONTRIBUTING.md)의 컨벤션을 따른다.

## Onboarding

신규 팀원 온보딩 또는 "온보딩 해줘" 요청 시 `scripts/setup.sh`를 실행한다.

```bash
./scripts/setup.sh
```

Prerequisites: Node.js 20+, Docker, direnv(선택). 스크립트가 pnpm 설치, 환경변수 복사, Docker 컨테이너 기동, DB 마이그레이션·시드를 자동으로 처리한다.

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

- `apps/web` - Next.js 16 프론트엔드 (App Router, Turbopack, next-auth v5, TanStack Query)
- `apps/api` - NestJS 백엔드 (JWT 인증, Prisma ORM)
- `@repo/database` - Prisma 스키마 및 클라이언트
- `@repo/shared-types` - Zod 스키마 및 TypeScript 타입 (프론트/백엔드 공유)
- `@repo/api-client` - API 클라이언트 클래스 (에러 타입 포함)

### Data Flow

```
Web (React Query) → ApiClient (@repo/api-client) → API (NestJS) → Prisma → PostgreSQL
```

### Key Patterns

**공유 스키마 (`@repo/shared-types`):** 도메인별 폴더 → `schema.ts`(Zod) + `types.ts` 분리. 프론트(`zodResolver`)와 백엔드(NestJS validation) 양쪽에서 동일 스키마 사용. 응답 타입은 `Prisma.XxxGetPayload<{include: ...}>` 패턴.

**API Client (`@repo/api-client`):** Singleton 클래스. `PromiseWithError<T, E>`로 성공/실패 타입 분리. 서버 에러는 `ProblemDocument` → 타입별 에러 클래스로 변환. 토큰 만료 시 `refreshPromise`로 중복 갱신 방지.

**API Hooks (`apps/web/hooks/api/`):** `createQueryHook(ApiClient.prototype.method, keyFn)`으로 타입 안전한 React Query 훅 생성.

**URL State (nuqs):** 탭, 필터, 정렬 등 UI 상태는 `useQueryState`로 URL 쿼리파라미터에 저장. `withDefault`에 `dayjs()` 등 동적 값 사용 금지 (hydration error).

**인증:** next-auth v5 Credentials + JWT access/refresh 토큰. ApiClient가 만료 시 자동 갱신.

**라우트 그룹:** `(general)/(dark)` 어두운 테마, `(general)/(light)` 밝은 테마, `(home)` 랜딩.

### 외부 도구 컨텍스트

**우선순위**: 프로젝트 전용 MCP(`amang-*` prefix)를 클라우드 커넥터(`claude_ai_*`)보다 항상 우선 사용한다. 클라우드 커넥터는 프로젝트 MCP가 없거나 연결 실패 시에만 fallback으로 사용.

- **Figma**: `hmVkj0Fq8c3dbeslIG31X9` (AMANG-New-) — MCP: `amang-figma` (Figma 공식 리모트 MCP, OAuth 인증)
- **Notion**: 아망 워크스페이스 — MCP: `amang-notion`
- **Slack**: Amang-Homepage 워크스페이스 — MCP: `amang-slack`
- **Sentry**: `amang-23` org (web, api 프로젝트) — MCP: `amang-sentry`
