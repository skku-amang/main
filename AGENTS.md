# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

AMANG - 성균관대학교 밴드 동아리 관리 시스템. 공연(Performance), 팀(Team), 세션(Session), 장비(Equipment) 관리 및 예약 기능 제공.

## 도메인 컨텍스트

@docs/reference/glossary.md
@docs/explanation/team.md

> 새 feature·문서·코드 작성 시 위 두 파일을 먼저 참조. 도메인 용어 추가는 [docs/reference/glossary.md](docs/reference/glossary.md), 영역 분담 변경은 [docs/explanation/team.md](docs/explanation/team.md)를 SSOT로 업데이트한 뒤 회의에서 확정.

## 문서

문서는 [Diátaxis](https://diataxis.fr/) 체계로 [`docs/`](docs/README.md)에 정리되어 있다. 새 문서 추가 시 목적에 맞는 칸(tutorials/how-to/reference/explanation)을 고른다. 설계 명세(spec)·계획(plan)은 [docs/explanation/design/](docs/explanation/design/)에 쓴다.

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

도구별 Web/CLI/MCP 접근 방법과 식별자는 아래 문서가 SSOT:

@docs/reference/tools.md

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
