<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 컴포넌트 고르는 순서

새 화면이나 컴포넌트를 만들 때 위에서부터 찾아 쓴다. 위에 맞는 게 있으면 아래로 내려가지 않는다.

1. 공통 컴포넌트 — [components/](components/)
2. 그 영역의 공통 컴포넌트 — 예: 운영진 화면은 [app/(admin)/\_components/](<app/(admin)/_components/>) (`DataTable`, `UserCell` 등)
3. 이미 설치된 shadcn 컴포넌트 — [components/ui/](components/ui/)
4. 아직 없는 shadcn 컴포넌트를 CLI로 그대로 추가
5. shadcn 컴포넌트를 변형한 새 공통 컴포넌트 — **만들기 전에 사용자에게 묻는다**
6. 그 페이지에서만 쓰는 로컬 컴포넌트 — 페이지 파일 옆 `_components/`
7. 인라인 (최후)

- 만들기 전에 1~4에서 비슷한 이름(`*Table`, `*Cell`, `*Avatar`, `*Badge` 등)을 먼저 검색한다. 몰라서 못 쓰는 경우가 가장 흔하다.
- 같은 모양이 두 곳 이상에서 반복되면 공통으로 올릴지 사용자에게 묻는다.
