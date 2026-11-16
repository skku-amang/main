<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 디자인 기준

디자인의 기준은 **코드**다. Figma는 2026-11부터 쓰지 않는다 (예전 시안은 기록용으로만 남음).

- 색·간격 등 토큰: [app/globals.css](app/globals.css)의 CSS 변수와 [tailwind.config.ts](tailwind.config.ts)
- 기본 부품: [components/ui/](components/ui/) (shadcn)
- 토큰은 shadcn 원래 뜻대로 쓴다. 예: `secondary`는 옅은 보조 배경이고 강조색이 아니다. 강조·주요 버튼은 `primary`(남색)

값(색 코드·간격 수치)은 위 파일에만 둔다. 여기에는 코드만 봐서는 알 수 없는 **규칙**만 적는다.

- **글자 대비**: 글자와 배경의 대비는 4.5:1 이상. 토큰 조합을 새로 만들면 대비부터 잰다 (밝은 파랑 위 남색 글자가 2.35:1이었던 사례: [#940](https://github.com/skku-amang/main/issues/940))
- **화면 테마**: `app/(general)/(dark)`는 남색 머리 띠 위에 흰 카드가 뜨는 화면, `(light)`는 밝은 바탕 화면
- **휴대폰 좌우 여백**: 내용은 화면 가장자리에서 16px. 밝은 화면에서 화면 전체를 감싸는 바깥 카드는 md부터만 쓰고, 어두운 화면은 카드를 유지하되 카드 안쪽 여백을 16px로 줄인다 ([#937](https://github.com/skku-amang/main/pull/937)). 화면 안에서 내용을 묶는 섹션 카드는 해당 없음
- **공연 단계 표시**: [PerformanceStageBadge](components/PerformanceStageBadge.tsx) 하나만 쓴다. 단계를 따로 "모집 중/마감"처럼 다시 만들지 않는다. 색은 부원이 할 일 있음(팀 모집·피드백)=진한 남색, 진행 중=옅은 파랑, 시작 전·끝=회색 ([#941](https://github.com/skku-amang/main/pull/941))

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

## 검색

- 사용자가 입력하는 검색은 [lib/hangul-search.ts](lib/hangul-search.ts)의 `matchesKorean`으로 맞춘다. 초성("ㅂㄷ" → "밴드")과 조합 중인 글자("밴" → "밴드")를 찾는다. `toLowerCase().includes()`를 직접 쓰지 않는다.
- 운영진 표([app/(admin)/\_components/data-table/DataTable.tsx](<app/(admin)/_components/data-table/DataTable.tsx>))의 검색창은 기본으로 `matchesKorean`을 쓴다. 드롭다운 필터처럼 값이 정확히 같아야 하는 열은 그 열에 `filterFn`을 따로 둔다.
