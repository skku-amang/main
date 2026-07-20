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

## 빠른 시작

```bash
git clone https://github.com/skku-amang/main.git
cd main
./scripts/setup.sh
pnpm dev
```

자세한 안내는 [처음 시작하기](docs/tutorials/getting-started.md)를 참고하세요.

## 문서

문서는 [Diátaxis](https://diataxis.fr/) 체계로 [`docs/`](docs/)에 정리되어 있습니다.

- 📖 [처음 시작하기](docs/tutorials/getting-started.md) — 개발 환경 세팅
- 🔧 [기여하기](docs/how-to/contributing.md) — 이슈 → 브랜치 → PR 워크플로
- 📚 [명령어](docs/reference/commands.md) · [도메인 모델](docs/reference/domain-model.md) · [용어집](docs/reference/glossary.md)
- 💡 [팀 분담](docs/explanation/team.md) · [아키텍처 결정(ADR)](docs/explanation/adr/) · [설계 문서](docs/explanation/design/)

전체 목차는 [docs/README.md](docs/README.md)에 있습니다.

## 커뮤니케이션

| 채널 | 용도 |
|------|------|
| [GitHub Issues](https://github.com/skku-amang/main/issues) | 버그 리포트, 기능 제안 |
| Slack (Amang-Homepage) | 실시간 소통 |
| Notion (아망 워크스페이스) | 기획, 회의록, 문서 |
| Figma | UI/UX 디자인 |
