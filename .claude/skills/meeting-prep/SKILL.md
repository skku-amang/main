---
name: meeting-prep
description: 직전 회의 이후 GitHub 이슈/PR, Sentry 에러를 수집하고 본인 회의 준비용 보고서를 텍스트로 출력한다. 회의록 작성, 회의 준비, meeting prep 요청 시 사용. 노션에는 작성하지 않음.
disable-model-invocation: true
argument-hint: "[이전 회의 노션 URL (생략 시 자동 탐색)]"
---

# meeting-prep — 회의 준비 보고서 생성 스킬

직전 회의 이후 본인의 활동(GitHub 이슈/PR, Sentry)을 수집하여 **Claude 텍스트 출력으로** 본인 회의 준비 보고서를 생성한다.

## 역할 분담 (중요)

이 스킬은 **노션에 절대 쓰지 않는다.** 회의록은 팀 공유용이라 사람이 합의된 결정사항만 손으로 작성해야 한다. 자동 수집 데이터는 회의 시작 전 본인이 "내가 한 일을 누락 없이 보고할 수 있도록" 정리하는 개인 준비용 메모일 뿐이다.

- ✅ Claude 텍스트 출력 (사용자가 회의 시작 전에 읽음)
- ❌ 노션 페이지 작성 (절대 금지 — 팀원들에게 다른 영역의 세부 컨텍스트는 노이즈)

## 프로젝트 상수

- **Notion 회의록 DB**: `29a779af-a9b3-44a1-954a-bc780abc9cfc` / data_source_id `34d38c39-7d5d-4862-b061-46f226a3da31` (이름: "일정")
- **GitHub 레포**: `skku-amang/main`
- **Sentry org**: `amang-23` (프로젝트: web, api)
- **개념 영역 (보고서 분류)**: 기획·디자인·프론트·백엔드·인프라·AX(AI Experience) — 보고서에서 본인 영역 구분용
- **GitHub 라벨 정책 (2026-04 재편 후)**: `type:` / `scope:` 라벨 폐지. 영역은 **PR 제목의 Conventional Commits scope**(`fix(web): ...`)와 변경 파일 경로로 판정. 라벨은 `kind:`/`priority:`/`from:`/`resolution:` 4축만 (이슈 위주) — 영역 판정에 사용 안 함. 정책 SSOT는 [CONTRIBUTING.md](file:///home/json/amang-worktrees/main/CONTRIBUTING.md)

## 실행 단계

### 1단계: 호출자 정보 확인

- `gh api user --jq .login`으로 GitHub 사용자명 확인
- 이 사용자가 작성한 이슈/PR만 수집 대상

### 2단계: 직전 회의 탐색

`$ARGUMENTS`에 노션 URL이 있으면 해당 페이지 사용. 없으면:

1. `mcp__amang-notion__API-query-data-source`로 회의록 데이터소스(`34d38c39-7d5d-4862-b061-46f226a3da31`)를 `일시` 내림차순으로 쿼리
2. 가장 최근 2개 페이지 가져오기 (직전 회의 = 두 번째, 현재 회의 = 첫 번째)
3. 직전 회의의 `일시` → 수집 시작일, 제목에서 차수(N차) 추출

### 3단계: 직전 회의에서 본인 분배 작업 추출 (선택)

직전 회의록 본문에 영역별 분배 사항이 있으면 파싱한다. 26-1 7차(2026-04-27) 이후 새 템플릿은 "팀 역할 조정" 섹션에 영역만 적고 세부 작업은 GitHub Issues로 관리하는 방식으로 전환. 따라서:

- 새 템플릿: 분배 파싱 생략하고 본인 영역(인프라/프론트/AX)만 확인
- 옛 템플릿(6차 이전): `# 작업 분배` 섹션 파싱하여 미이행 항목 표시

### 4단계: 데이터 수집 (병렬)

서브에이전트 3개를 병렬로 실행한다.

#### 에이전트 A: GitHub Issues
```
gh issue list --repo skku-amang/main --state all \
  --search "author:{사용자명} created:{시작일}..{오늘}" \
  --json number,title,state,labels,createdAt,closedAt --limit 100
```
+ assignee 검색도 추가 (다른 사람이 만든 이슈에 본인 할당된 케이스):
```
gh issue list --repo skku-amang/main --state all \
  --search "assignee:{사용자명} updated:{시작일}..{오늘}" \
  --json number,title,state,labels,createdAt,closedAt --limit 100
```

#### 에이전트 B: GitHub PRs
```
gh pr list --repo skku-amang/main --state all \
  --search "author:{사용자명} created:{시작일}..{오늘}" \
  --json number,title,state,labels,createdAt,mergedAt,url,body --limit 100
```
PR body에서 `#숫자` 패턴으로 연결 이슈 추출.

#### 에이전트 C: Sentry 에러
`mcp__amang-sentry__list_issues`로 web, api 프로젝트 조회 (클라우드 커넥터 `mcp__claude_ai_Sentry__*` 사용 금지).
- `firstSeen:>{시작일}` (신규)
- `lastSeen:>{시작일}` is:unresolved (재발)
- 같은 기간 resolved 이슈도 포함 (PR 매핑용)
- 이벤트 1-2건 노이즈는 생략 가능

### 5단계: 영역별 분류 (CC 제목 + 변경 파일 경로 기반)

GitHub `scope:` 라벨이 폐지(2026-04 재편)되었으므로 영역은 다음 순서로 판정한다.

1. **PR 제목의 CC scope** (`fix(web): ...` 형태)
   - `web` → 프론트
   - `api` → 백엔드
   - `db`, `types`, `api-client`, `ui` → 백엔드
   - `infra` → 인프라
2. **CC scope 없거나 모호하면 변경 파일 경로로 추정**
   - `apps/web/**` → 프론트
   - `apps/api/**`, `packages/database/**`, `packages/shared-types/**`, `packages/api-client/**`, `packages/ui/**` → 백엔드
   - `infra/**`, `k8s/**`, `*.tf`, `Dockerfile*`, `.github/workflows/**` → 인프라
   - `.claude/**`, `docs/superpowers/**`, `scripts/**` → AX/도구 (보고서에선 AX 섹션)
3. **CC 형식 위반 PR**: 별도 섹션 "⚠️ CC 형식 위반 PR"로 표시 — 제목 정정 권장

`kind:` / `priority:` / `from:` / `resolution:` 라벨은 영역 판정에 사용 안 함. 다만 `priority: high`/`critical`은 보고서에서 중요도 🔴 가산점에 활용 가능.

이슈는 PR과 달리 CC 형식 안 따름(자연어 제목). 이슈 영역은 본인 assignee 여부 + 본문 내용 + 라벨(`kind:` 등)로 추정.

### 6단계: 텍스트 보고서 출력

[examples/output.md](examples/output.md) 형식대로 마크다운 텍스트로 출력한다.

핵심 규칙:
- **마크다운 표 형식**: 사용자가 한눈에 스캔 가능하도록
- **본인 영역만**: 다른 사람 영역은 표시 안 함 (수집 자체를 본인 author로 한정했으므로 자연스럽게 필터됨)
- **링크 필수**: 이슈/PR/Sentry 링크는 클릭 가능한 마크다운 링크
- **중요도**: 🔴 높음(Sentry·미이행·보안) / 🟡 보통(버그·진행 중) / ⚪ 낮음(chore·제안)
- **진행 아이콘**: ✅ 완료 / 🔧 진행 중 / ⏸️ 미착수 / ⚠️ 미해결
- **정렬**: ✅ → 🔧 → ⏸️ → ⚠️
- **이슈-PR 연결**: `#이슈 → PR #번호` 형태
- **Insight 섹션**: 패턴(예: 미이행 작업, CC 형식 위반, 영역 편중)을 뽑아 회의에서 짚을 만한 포인트 1-3개 제시

### 7단계: 마무리

출력 후 종료. 사용자가 회의에서 직접 활용하므로 **노션 작성 단계 없음.**

## 주의사항

- Notion MCP 서버 연결 안 되면 `direnv allow` 후 세션 재시작
- Sentry는 반드시 `mcp__amang-sentry__*` 사용 (클라우드 커넥터 절대 금지 — 메모리 [feedback_no_cloud_connector.md](file:///home/json/.claude/projects/-home-json-amang-worktrees-main/memory/feedback_no_cloud_connector.md))
- 회의록 DB에 현재 회의 페이지가 아직 없어도 **에러 아님** — 직전 회의만 잡아서 수집 진행
