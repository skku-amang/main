# Sentry Triage Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sentry 이슈·피드백을 자동 분류·처리하는 `sentry-triage` 스킬 구현 및 선행 라벨 시스템 재편.

**Architecture:** 두 단계로 구성. Phase 0에서 Conventional Commits와 중복되는 기존 `type:/scope:` 라벨을 제거하고 `kind:/priority:/status:/from:` prefix 체계로 전환 (선언적 스크립트). Phase 1에서 `.claude/skills/sentry-triage/`에 스킬 파일 3종을 작성 — Collector(Sentry MCP) / Classifier(regex + 휴리스틱) / Actor(gh CLI + Sentry MCP)의 3층 분리.

**Tech Stack:** Bash + `gh` CLI (라벨 관리·이슈 생성), Claude Code Skill (Markdown), `amang-sentry` MCP (Sentry 접근).

**Spec:** [docs/superpowers/specs/2026-04-12-sentry-triage-design.md](../specs/2026-04-12-sentry-triage-design.md)

---

## File Structure

```
skku-amang/main/
├── scripts/
│   ├── setup-labels.sh         # [신규] Phase 0 — 선언적 라벨 정의·동기화
│   └── migrate-old-labels.sh   # [신규] Phase 0 — 기존 type:/scope: 제거
├── CONTRIBUTING.md             # [수정] 라벨 섹션 전면 개편
├── .claude/
│   └── skills/
│       └── sentry-triage/
│           ├── SKILL.md            # [신규] Phase 1 — 트리거·흐름·액션 프로토콜
│           ├── triage-criteria.md  # [신규] Phase 1 — 라벨 기준 (진화 문서)
│           └── issue-template.md   # [신규] Phase 1 — GH 이슈 본문 템플릿
└── docs/superpowers/
    ├── specs/2026-04-12-sentry-triage-design.md  # [기존] 스펙
    └── plans/2026-04-12-sentry-triage.md          # [이 파일]
```

**파일별 책임**:
- `setup-labels.sh`: 선언적 라벨 매니페스트 정의 + `gh label create/edit`로 동기화. 멱등성 보장.
- `migrate-old-labels.sh`: 기존 `type:*`, `scope:*`, `v0` 라벨을 이슈/PR에서 제거 후 삭제.
- `CONTRIBUTING.md`: 새 라벨 체계 + 이슈/PR별 라벨 사용 규칙 문서화.
- `SKILL.md`: 스킬 본문. 트리거 조건, 5단계 실행 흐름, 승인 게이트 프로토콜.
- `triage-criteria.md`: 5라벨(🔥/📝/👀/🚫/💡) 분류 기준. 초기 휴리스틱 + "사용하며 조정" 주석.
- `issue-template.md`: GH 이슈 생성 시 body 포맷.

---

## Phase 0: 라벨 시스템 재편

### Task 1: 선언적 라벨 매니페스트 스크립트 작성

**Files:**
- Create: `scripts/setup-labels.sh`

- [ ] **Step 1: 스크립트 작성**

```bash
#!/usr/bin/env bash
# setup-labels.sh — skku-amang/main 레포의 라벨을 선언적으로 동기화.
# 사용법: scripts/setup-labels.sh [--dry-run]
# 참고: CONTRIBUTING.md의 라벨 규칙과 일치시킬 것 (SSOT는 이 스크립트).
set -euo pipefail

REPO="skku-amang/main"
DRY_RUN="${1:-}"

# 라벨 매니페스트: "이름|색상|설명"
LABELS=(
  # kind: (이슈 종류) — 파랑 계열
  "kind: bug|3B82F6|버그 — 작동하지 않거나 기대와 다르게 동작"
  "kind: enhancement|60A5FA|기능 추가 또는 기존 기능 개선"
  "kind: question|93C5FD|질문 — 사용법 / 안내 요청"
  "kind: task|BFDBFE|일반 작업 (리팩토링, 문서, 의존성 등)"

  # priority: — 빨강 계열
  "priority: critical|B91C1C|즉시 수정 필요 (프로덕션 장애 / 다수 영향)"
  "priority: high|DC2626|이번 스프린트 내 처리"
  "priority: low|FCA5A5|여유 있을 때 처리"

  # status: — 노랑 계열
  "status: needs-triage|FBBF24|트리아지 대기"
  "status: observing|FCD34D|재발 모니터링 중"
  "status: confirmed|FDE68A|재현 확인됨"
  "status: blocked|F59E0B|진행 불가 — 외부 의존성 대기"

  # from: (출처) — 초록 계열
  "from: sentry|10B981|Sentry 자동 유입"
  "from: user-feedback|34D399|유저 피드백"

  # resolution: (close 사유) — 회색 계열
  "resolution: duplicate|9CA3AF|중복"
  "resolution: wontfix|6B7280|수정하지 않음"
  "resolution: invalid|D1D5DB|유효하지 않음"

  # GitHub 표준 — 오픈소스 기여 유입
  "good first issue|7C3AED|첫 기여자에게 적합"
  "help wanted|8B5CF6|컨트리뷰션 환영"
)

sync_label() {
  local spec="$1"
  local name color desc
  IFS='|' read -r name color desc <<< "$spec"

  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "DRY: sync '$name' color=$color"
    return
  fi

  if gh label list --repo "$REPO" --limit 200 --json name -q '.[].name' | grep -Fxq "$name"; then
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "updated: $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "created: $name"
  fi
}

echo "Syncing ${#LABELS[@]} labels to $REPO..."
for spec in "${LABELS[@]}"; do
  sync_label "$spec"
done
echo "Done."
```

- [ ] **Step 2: 실행 권한 부여**

```bash
chmod +x scripts/setup-labels.sh
```

- [ ] **Step 3: 드라이런으로 검증**

```bash
./scripts/setup-labels.sh --dry-run
```

Expected: `DRY: sync 'kind: bug' color=3B82F6` 포함 18줄 출력, 실제 API 호출 없음.

- [ ] **Step 4: 커밋**

```bash
git add scripts/setup-labels.sh
git commit -m "chore(infra): 라벨 선언적 관리 스크립트 추가 (setup-labels.sh)"
```

---

### Task 2: 기존 라벨 마이그레이션 스크립트

**Files:**
- Create: `scripts/migrate-old-labels.sh`

- [ ] **Step 1: 스크립트 작성**

```bash
#!/usr/bin/env bash
# migrate-old-labels.sh — 기존 type:/scope:/v0 라벨 제거.
# 이슈는 type: → kind: 매핑 후 제거. PR은 단순 제거 (제목이 SSOT).
# 주의: 되돌릴 수 없음. 실행 전 사용자 확인 받을 것.
set -euo pipefail

REPO="skku-amang/main"

# 이슈 전용 매핑 (type: → kind:). PR은 이 매핑 건너뜀.
declare -A TYPE_TO_KIND=(
  ["type: fix"]="kind: bug"
  ["type: feat"]="kind: enhancement"
  ["type: refactor"]="kind: task"
  ["type: docs"]="kind: task"
  ["type: chore"]="kind: task"
  ["type: test"]="kind: task"
)

# 제거 대상 (모두)
OLD_LABELS=(
  "type: chore" "type: docs" "type: feat" "type: fix" "type: refactor" "type: test"
  "scope: frontend" "scope: backend" "scope: infra"
  "v0"
)

echo "⚠️  다음 라벨이 제거됩니다:"
printf '  - %s\n' "${OLD_LABELS[@]}"
echo ""
echo "이슈에 한해 type: 라벨은 다음과 같이 kind:로 매핑됩니다:"
for k in "${!TYPE_TO_KIND[@]}"; do
  echo "  - $k → ${TYPE_TO_KIND[$k]}"
done
echo "(PR은 매핑 없이 단순 제거 — 제목이 SSOT)"
echo ""
read -p "계속하시겠습니까? [y/N] " confirm
[[ "$confirm" == "y" ]] || { echo "취소됨."; exit 0; }

for label in "${OLD_LABELS[@]}"; do
  if ! gh label list --repo "$REPO" --limit 200 --json name -q '.[].name' | grep -Fxq "$label"; then
    echo "skip (없음): $label"
    continue
  fi

  new_kind="${TYPE_TO_KIND[$label]:-}"

  # 이슈 처리: 매핑이 있으면 kind: 추가 후 제거, 없으면 단순 제거
  echo "Processing issues with '$label'..."
  gh issue list --repo "$REPO" --label "$label" --state all --limit 500 \
    --json number -q '.[].number' | while read -r n; do
    if [[ -n "$new_kind" ]]; then
      gh issue edit "$n" --repo "$REPO" \
        --add-label "$new_kind" --remove-label "$label" >/dev/null
    else
      gh issue edit "$n" --repo "$REPO" --remove-label "$label" >/dev/null
    fi
  done

  # PR 처리: 단순 제거만 (매핑 없음)
  echo "Removing '$label' from PRs..."
  gh pr list --repo "$REPO" --label "$label" --state all --limit 500 \
    --json number -q '.[].number' | while read -r n; do
    gh pr edit "$n" --repo "$REPO" --remove-label "$label" >/dev/null
  done

  gh label delete "$label" --repo "$REPO" --yes
  echo "deleted: $label"
done
echo "Done."
```

**주의**: 이 스크립트는 `setup-labels.sh`가 먼저 실행되어 `kind: bug` / `kind: enhancement` / `kind: task` 라벨이 레포에 존재해야 작동. 실행 순서 엄수.

- [ ] **Step 2: 실행 권한 부여**

```bash
chmod +x scripts/migrate-old-labels.sh
```

- [ ] **Step 3: 커밋**

```bash
git add scripts/migrate-old-labels.sh
git commit -m "chore(infra): 기존 라벨 마이그레이션 스크립트 추가"
```

---

### Task 3: CONTRIBUTING.md 라벨 섹션 재작성

**Files:**
- Modify: `CONTRIBUTING.md` (라벨 섹션 전체 교체)

- [ ] **Step 1: 기존 "라벨" 섹션을 아래로 교체**

기존 섹션 (`## 라벨`부터 다음 `## 이슈 컨벤션` 전까지) 전체를 다음으로 대체:

```markdown
## 라벨

이슈/PR 라벨은 **제목으로 표현할 수 없는 메타데이터**만 담습니다. `type:` / `scope:`는 Conventional Commits 제목(`fix(web): ...`)으로 표현되므로 라벨로 중복 관리하지 않습니다.

라벨 자체는 `scripts/setup-labels.sh`로 선언적 관리되며, 이 스크립트가 SSOT입니다. 수동 생성·수정 금지.

### 축별 라벨

| 축 | 값 | 대상 | 필수 |
| --- | --- | --- | --- |
| `kind:` | `bug`, `enhancement`, `question`, `task` | 이슈 | ✅ |
| `priority:` | `critical`, `high`, `low` | 이슈 + PR | 맥락에 따라 |
| `status:` | `needs-triage`, `observing`, `confirmed`, `blocked` | 이슈 + PR | 맥락에 따라 |
| `from:` | `sentry`, `user-feedback` | 이슈 | 자동 유입일 때 |
| `resolution:` | `duplicate`, `wontfix`, `invalid` | 이슈 Close 시 | Close 사유 필요 시 |
| (단일) | `good first issue`, `help wanted` | 이슈 | 해당 시 |

### 사용 규칙

**이슈**:
- `kind:*` 1개 **필수** (템플릿에서 자동 설정)
- 긴급도 판단 후 `priority:*` 추가
- 트리아지 대기 상태면 `status: needs-triage`
- Sentry나 유저 피드백에서 유입됐으면 `from:*`

**PR**:
- 기본적으로 라벨 없이 제출 (제목이 SSOT)
- 머지 순서 중요하면 `priority:*`
- 리뷰·배포 블로킹 상태면 `status:*`

### 라벨 변경이 필요할 때

1. `scripts/setup-labels.sh`의 `LABELS` 배열을 수정
2. 이 문서의 표도 함께 업데이트
3. `./scripts/setup-labels.sh`로 동기화
4. 위 변경사항을 하나의 PR로 커밋

## 이슈 제목 컨벤션

이슈 제목은 **자연어**로 작성합니다. Conventional Commits(`fix(...)`, `feat(...)`) 포맷을 쓰지 않습니다 — CC는 *변경 행위*(커밋/PR)를 분류하는 도구이고, 이슈는 *문제/요청*을 기술하는 대상이라 본질이 다릅니다.

| 이슈 유형 | 예시 |
| --- | --- |
| 버그 리포트 | `필터 변경 시 페이지네이션이 초기화되지 않음` |
| 기능 요청 | `예약 목록 엑셀(.xlsx) 내보내기` |
| 질문 | `장비 예약 가능 기간은?` |
| Sentry 자동 유입 | `로그인 시 TypeError: Cannot read 'user' of undefined` (에러 그대로) |
| User Feedback | `예약 목록을 엑셀로 내보낼 수 있었으면 좋겠어요` (유저 원문) |

분류 정보(`bug`/`enhancement`)는 `kind:` 라벨이 담당하므로 제목에 중복할 필요 없습니다.

**이슈 ↔ PR 관계**: 이슈 제목과 PR 제목은 **형식이 다릅니다**. PR 생성 시 CC 포맷으로 변환하세요.
- 이슈: `필터 변경 시 페이지네이션이 초기화되지 않음`
- PR: `fix(web): 필터 변경 시 페이지네이션 초기화`

기존 CC 스타일 이슈 제목은 **그대로 둡니다**. 앞으로 생성되는 이슈만 이 규칙을 적용합니다.
```

- [ ] **Step 2: 커밋**

```bash
git add CONTRIBUTING.md
git commit -m "docs(contributing): 라벨 체계 — kind/priority/status/from prefix 전환"
```

---

### Task 4: 라벨 스크립트 실제 실행 (사용자 승인 필요)

**Files:** (변경 없음, GitHub API 호출만)

- [ ] **Step 1: 사용자에게 확인 받기**

```
"Phase 0 스크립트 실행 단계입니다. 다음을 실행합니다:
1. ./scripts/setup-labels.sh (신규 라벨 생성)
2. ./scripts/migrate-old-labels.sh (기존 type:/scope:/v0 제거)

각각 스크립트 자체의 확인 프롬프트가 있지만, 되돌릴 수 없으니 승인해 주세요."
```

- [ ] **Step 2: setup 스크립트 실행**

```bash
./scripts/setup-labels.sh
```

Expected: 18개 라벨 created/updated.

- [ ] **Step 3: 확인**

```bash
gh label list --repo skku-amang/main --limit 100 | grep -E '^(kind|priority|status|from|resolution|good|help)'
```

Expected: 18줄 출력.

- [ ] **Step 4: migrate 스크립트 실행**

```bash
./scripts/migrate-old-labels.sh
```

프롬프트에서 `y` 입력.

Expected: 기존 type:/scope:/v0 라벨 10개 제거 + 관련 이슈/PR에서도 떨어짐.

- [ ] **Step 5: 커밋 없음** — 스크립트 실행 결과는 GitHub 상태, 코드 변경 없음.

---

## Phase 1: Sentry Triage 스킬 구현

### Task 5: 스킬 디렉토리 + triage-criteria.md 작성

**Files:**
- Create: `.claude/skills/sentry-triage/triage-criteria.md`

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p .claude/skills/sentry-triage
```

- [ ] **Step 2: `triage-criteria.md` 작성**

```markdown
# Sentry Triage 분류 기준

각 Sentry 이슈·피드백을 아래 5라벨 중 하나로 분류한다. 우선순위가 높은 것부터 검사하여 첫 매치에서 확정.

## 🔥 즉시 수정 (priority: critical)

다음 중 **하나라도** 해당:
- 영향 유저 수 ≥ 5명
- 최근 24시간 이벤트 수가 기저(지난 7일 평균) 대비 5배 이상
- 핵심 flow 키워드가 스택트레이스·URL·메시지에 포함:
  `login`, `auth`, `signup`, `payment`, `reservation`, `booking`, `equipment`

## 🚫 무시 추천 (priority: 없음, 사용자가 수동 archive)

다음 중 **하나라도** 해당:
- 에러 타입이 알려진 무해: `ChunkLoadError`, `AbortError`, `ResizeObserver loop limit exceeded`, `Network request failed`(취소 컨텍스트)
- User-Agent에 봇 패턴: `bot`, `crawler`, `spider`, `HeadlessChrome`(테스트 외)
- 개발 환경(`environment: development` 또는 `local`)

## 💡 기능 요청 (User Feedback 전용)

**User Feedback일 때만** 다음 패턴 매치:
- "있으면 좋겠다", "추가해 주세요", "~할 수 있나요" (의문문이 아닌 요청문)
- "~하고 싶어요" + 현재 불가능한 동작
- 에러 증상 언급 없음

(에러 키워드: "에러", "안 돼요", "작동 안 함", "실패" 등이 포함되면 버그로 분류)

## 📝 이슈 등록 (priority: high)

다음 **전부** 해당:
- 위 🔥/🚫/💡에 해당하지 않음
- 재현 가능한 스택트레이스 존재
- 영향 유저 ≥ 1명

## 👀 관찰 (priority: low)

나머지 전부. 예:
- 유저 1명, 재발 없음
- 새 유형이라 영향도 판단 불가

---

## 조정 이력

이 문서는 **사용하며 진화**하는 기준이다. 실제 트리아지에서 기준과 판단이 어긋난 케이스를 기록한다.

<!-- 예시
### 2026-04-15
- `ResizeObserver loop limit exceeded`를 🚫로 자동 분류했는데, 모바일에서 실제 UX 문제였음.
  → 무해 목록에서 제거하고 📝로 처리하도록 변경.
-->

(아직 비어 있음)
```

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/sentry-triage/triage-criteria.md
git commit -m "feat(skill): sentry-triage 분류 기준 문서 추가"
```

---

### Task 6: issue-template.md 작성

**Files:**
- Create: `.claude/skills/sentry-triage/issue-template.md`

- [ ] **Step 1: 템플릿 파일 작성**

```markdown
# GH 이슈 body 템플릿

스킬이 GH 이슈를 자동 생성할 때 이 템플릿을 사용한다. `{{...}}` 플레이스홀더는 Sentry MCP 데이터로 치환.

---

~~~markdown
> **Source**: [Sentry 이슈]({{sentry_permalink}})
> **영향**: 유저 {{user_count}}명 / 이벤트 {{event_count}}건 / 최근 발생: {{last_seen}}

## 요약

{{message_or_feedback}}

## 스택트레이스

` ` `
{{stack_top_10_lines}}
` ` `

## 재현 조건 (추정)

- URL: {{url}}
- 브라우저: {{browser}}
- 환경: {{environment}}
- 릴리스: {{release}}

## User Feedback (있을 경우)

> {{user_feedback_text}}

---

_이 이슈는 `sentry-triage` 스킬로 자동 생성되었습니다._
~~~
```

(렌더링 시 `` ` ` ` ``를 ` ``` ` 로 바꿀 것 — 중첩 fence 이슈 회피용 표기.)

- [ ] **Step 2: 커밋**

```bash
git add .claude/skills/sentry-triage/issue-template.md
git commit -m "feat(skill): sentry-triage GH 이슈 템플릿 추가"
```

---

### Task 7: SKILL.md 작성

**Files:**
- Create: `.claude/skills/sentry-triage/SKILL.md`

- [ ] **Step 1: SKILL.md 작성**

```markdown
---
name: sentry-triage
description: Sentry 이슈·피드백을 조회하고 5단계 라벨(🔥/📝/👀/🚫/💡)로 분류한 뒤 승인 게이트를 거쳐 GH 이슈 생성·Sentry 태그 부착 등 후속 액션을 자동화한다. 사용자가 "sentry 확인", "트리아지", "센트리 봐줘" 등을 말하거나 /sentry-triage 커맨드가 호출될 때 활성화한다.
---

# Sentry Triage 스킬

## 목적

Sentry의 unresolved 이슈와 User Feedback을 트리아지 프레임워크로 분류·조치한다. 단순 조회가 아니라 각 항목에 우선순위 라벨을 추천하고, 사용자 승인 후 GH 이슈 생성 / Sentry 태그 부착 / archive 추천을 수행한다.

## 전제 조건

- `amang-sentry` MCP 연결됨 (org: `amang-23`, projects: `web`, `api`)
- `gh` CLI 인증됨 (skku-amang/main 접근 권한)
- 라벨 체계: `kind:`, `priority:`, `status:`, `from:` prefix 라벨이 레포에 존재해야 함 — 없으면 중단하고 `scripts/setup-labels.sh` 실행 안내

## 실행 흐름

### 1. 조회 (Collector)

기본 파라미터:
- 프로젝트: `web`, `api`
- 환경: `production`
- 상태: `unresolved`
- 기간: 최근 7일
- 이슈 + User Feedback 모두

사용자가 인자로 오버라이드 가능 (예: "dev 환경 14일치"). 파라미터를 파싱해 조회 범위 조정.

`amang-sentry` MCP의 `list_issues` + User Feedback 조회 도구 사용. 각 항목에 대해 수집:
- ID, 제목, 메시지, 스택트레이스 상위 10줄
- 영향 유저 수, 이벤트 수, first_seen, last_seen
- tags: url, browser, environment, release
- 연결된 User Feedback (있을 경우 원문)

### 2. 자동 분류 (Classifier)

[triage-criteria.md](triage-criteria.md)의 기준을 우선순위대로 적용:
1. 🔥 즉시 수정 기준 매치 검사
2. 🚫 무시 기준 매치 검사
3. 💡 기능 요청 기준 검사 (User Feedback일 때만)
4. 📝 이슈 등록 기준 검사
5. 나머지는 👀 관찰

각 분류에 **근거(어떤 시그널을 봤는지)**를 2-3줄로 첨부.

### 3. 사용자 검토

5개 섹션으로 묶어 테이블·리스트 출력 (아래 "출력 형식" 참조). 사용자는 이 시점에 라벨 수정 지시 가능:
- "3번은 관찰로 바꿔"
- "💡의 2번은 Notion 대신 GH 이슈로"

### 4. 액션 실행 (Actor, 항목별 승인 게이트)

각 항목마다 `[y/n/s(kip)]` 프롬프트. **승인받은 항목만** 실행.

| 라벨 | 액션 |
| --- | --- |
| 🔥 | `gh issue create --repo skku-amang/main --label "kind: bug,priority: critical,from: sentry"(또는 from: user-feedback) --title "..." --body "..."` — body는 [issue-template.md](issue-template.md) 적용. **제목은 자연어**(CC 포맷 금지): Sentry 유입이면 에러 메시지 그대로 (예: `로그인 시 TypeError: Cannot read 'user' of undefined`), User Feedback이면 유저 원문 또는 요약 |
| 📝 | 위와 동일하나 `priority: high` 또는 `low` (영향 유저 ≥3이면 high) |
| 👀 | Sentry MCP의 `update_issue`로 `triaged` + `observing` 태그 부착 |
| 🚫 | **출력만** — "Sentry 웹에서 Archive 권장" 메시지. 자동 실행 안 함. |
| 💡 | 사용자에게 "GH 이슈" vs "Notion 아이디어 DB" vs "건너뜀" 선택 → GH면 `kind: enhancement, from: user-feedback, priority: low`, Notion이면 `amang-notion` MCP로 page 생성 |

### 5. 종료 요약

```
요약: 처리 완료 N건 / 보류 M건 / 실패 K건
- 🔥 N1건 → GH 이슈 #AAA, #BBB 생성됨
- 📝 N2건 → GH 이슈 #CCC~#DDD 생성됨
- 👀 N3건 → Sentry 태그 부착됨
- 🚫 N4건 → 수동 archive 권장 목록 (아래 링크)
- 💡 N5건 → GH N개, Notion N개
```

## 출력 형식

~~~markdown
## Sentry Triage (YYYY-MM-DD)

조회: web + api / prod / 7d / unresolved — 총 N건

### 🔥 즉시 수정 (N건)
1. [TypeError: Cannot read 'user' of undefined](sentry-link)
   - 영향: 12명 / 최근 24h 3배 증가
   - 근거: 유저 5명↑ + `login` 키워드 매치
   - [y/n/s] GH 이슈 생성 (`kind: bug`, `priority: critical`, `from: sentry`)

### 📝 이슈 등록 (N건)
...

### 👀 관찰 (N건)
...

### 🚫 무시 추천 (N건)
...

### 💡 기능 요청 (N건)
1. "예약 목록을 엑셀로 내보낼 수 있었으면 좋겠어요" ([feedback link])
   - [g/n/s/k] g=GH 이슈 / n=Notion DB / s=건너뜀 / k=Skip all
~~~

## 에러 처리

- **MCP 연결 실패**: 즉시 중단, 사용자에게 원인 표시. fallback 없음.
- **GH 이슈 생성 실패**: 해당 항목만 실패 표시하고 계속 진행.
- **라벨 부재**: `kind: bug` 등이 레포에 없을 경우 "라벨 체계가 설정되지 않았습니다. `./scripts/setup-labels.sh` 를 먼저 실행하세요." 안내 후 중단.
- **분류 판단 불가**: 👀(관찰)로 fallback.

## 드라이런 모드

사용자가 "드라이런으로", "--dry-run", "실제 실행 안 하고"를 지정하면 Actor 층의 side effect 대신 "다음 작업을 수행할 예정:" 출력만. 드라이런에서는 승인 프롬프트 생략.

## 기준 조정

분류 결과가 사용자 판단과 자주 어긋나면 [triage-criteria.md](triage-criteria.md) "조정 이력" 섹션에 케이스 기록 + 규칙 수정을 제안. 규칙은 이 파일을 편집해서 반영.
```

- [ ] **Step 2: `triage-criteria.md`의 주석 표기 수정 참고 확인**

`issue-template.md`에서 표기한 `` ` ` ` ``를 실제 렌더 시 ` ``` `로 치환하는 규칙을 SKILL.md 본문에도 명시했는지 확인. (필요 시 "## 에러 처리" 뒤에 섹션 추가.)

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/sentry-triage/SKILL.md
git commit -m "feat(skill): sentry-triage SKILL.md 추가 — 5단계 트리아지 프로토콜"
```

---

### Task 8: 엔드투엔드 수동 검증

**Files:** (변경 없음 — 동작 검증만)

- [ ] **Step 1: 드라이런으로 스킬 호출**

대화 창에서 다음 입력:
```
/sentry-triage 드라이런
```

Expected: Collector가 Sentry MCP로 조회, Classifier가 라벨 붙여 출력, Actor는 실행 계획만 출력.

- [ ] **Step 2: 분류 결과 샘플 검증**

출력된 5섹션에서:
- 🔥/📝/👀/🚫/💡 각각이 최소 1건 있는지 확인 (실제 분포에 따라 없을 수 있음 — OK)
- 각 항목에 "근거" 줄이 2-3줄로 첨부됐는지 확인
- URL/링크가 모두 클릭 가능한지 확인

불일치 발견 시 [triage-criteria.md](.claude/skills/sentry-triage/triage-criteria.md) 조정하고 재실행.

- [ ] **Step 3: 실 실행 모드로 1-2건만 처리**

```
/sentry-triage
```

- 📝 또는 👀 중 **1-2건만** 승인하여 실제 액션 테스트
- GH 이슈 생성 시 [issue-template.md](.claude/skills/sentry-triage/issue-template.md) 그대로 렌더됐는지 확인
- Sentry 태그 부착 시 Sentry 웹에서 `observing` 태그 확인

- [ ] **Step 4: 검증 결과 기록**

`triage-criteria.md` 조정 이력 섹션에 첫 실행 날짜 + 관찰한 기준 오차 기록. (없으면 "기준 잘 작동" 한 줄.)

- [ ] **Step 5: 커밋 (검증 이력 반영된 경우에만)**

```bash
git add .claude/skills/sentry-triage/triage-criteria.md
git commit -m "docs(skill): sentry-triage 첫 실행 검증 이력 기록"
```

---

### Task 9: PR 생성

**Files:** (변경 없음)

- [ ] **Step 1: 최종 diff 확인**

```bash
git log --oneline main..HEAD
git diff main...HEAD --stat
```

Expected: 6-8개 커밋, 7-8개 파일 변경.

- [ ] **Step 2: push**

```bash
git push -u origin feat/sentry-triage-skill
```

- [ ] **Step 3: PR 생성**

```bash
gh pr create --title "feat(skill): Sentry 트리아지 자동화 스킬 + 라벨 체계 재편" \
  --assignee "@me" \
  --label "kind: enhancement,priority: low" \
  --body "$(cat <<'EOF'
## Summary

- Conventional Commits와 중복되던 `type:/scope:` 라벨 제거, `kind:/priority:/status:/from:` prefix 체계로 전환
- `sentry-triage` Claude Code 스킬 추가 — Sentry 이슈·피드백을 5단계(🔥📝👀🚫💡)로 자동 분류, 승인 게이트로 GH 이슈 생성·Sentry 태그 부착

자세한 배경·설계는 [스펙](docs/superpowers/specs/2026-04-12-sentry-triage-design.md) 참고.

## Test plan

- [x] `./scripts/setup-labels.sh --dry-run` 검증
- [x] `./scripts/setup-labels.sh` 실행 후 `gh label list` 결과 18개 라벨 확인
- [x] `./scripts/migrate-old-labels.sh` 실행 후 기존 type:/scope:/v0 제거 확인
- [x] `/sentry-triage 드라이런` 실행, 5섹션 출력 확인
- [x] `/sentry-triage` 실 실행으로 1-2건 GH 이슈 생성 확인
- [x] 생성된 이슈의 라벨·body 포맷 검증

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: CI 통과 확인**

PR 페이지에서 체크 통과 확인. 실패 시 원인 분석하여 수정.

---

## 완료 기준

- [x] `CONTRIBUTING.md` 라벨 매니페스트 섹션 + 이슈 제목 컨벤션 추가
- [x] skku-amang/main 레포에 신규 라벨 적용, 기존 type:/scope:/v0 제거 (수동, REST API)
- [x] `.claude/skills/sentry-triage/SKILL.md`, `triage-criteria.md` 작성
- [x] `.github/ISSUE_TEMPLATE/sentry_auto.md` 추가 + 기존 템플릿 라벨 갱신
- [x] 드라이런으로 스킬 동작 검증 (실 데이터 22건 처리, 4건 resolve, 1건 duplicate 처리)
- [x] PR 생성 (#456), 머지 대기 중

## Divergence Log

플랜 작성 후 실제 진행 중 변경된 결정사항. 후일 이 플랜으로 작업을 추적할 때 혼란 방지용.

### 라벨 자동화 폐기 (Task 1·2 삭제)

- **원래 계획**: `scripts/setup-labels.sh`(선언적 sync) + `scripts/migrate-old-labels.sh`(일회성 마이그레이션) 두 스크립트 작성·커밋
- **실제 결정**: 두 스크립트 모두 삭제. **CONTRIBUTING.md의 "라벨 매니페스트" 표를 SSOT**로 삼고 GitHub UI/`gh label`/REST API 수동 관리
- **이유**: 라벨 변경 빈도가 매우 낮고(연 1-2회) drift 복구 비용도 낮음. 자동화 ROI 사실상 0. 업계 관행도 소규모 팀은 수동 관리 (kubernetes 같은 다중 레포 대형 org만 자동화)
- **영향**: Task 4(스크립트 실행)는 일회성 `curl` 호출로 대체 (`SENTRY_ACCESS_TOKEN` + `gh label create/edit/delete`)

### 이슈 템플릿 위치 변경 (Task 6 재배치)

- **원래 계획**: `.claude/skills/sentry-triage/issue-template.md`
- **실제 결정**: `.github/ISSUE_TEMPLATE/sentry_auto.md`로 이동. 스킬은 참조만
- **이유**: SSOT — GitHub 관례상 이슈 템플릿은 `.github/ISSUE_TEMPLATE/`. 스킬이 별도 보관하면 drift 발생. 부수 효과로 사람이 GitHub UI에서 New Issue → Sentry Auto 선택해 수동 작성도 가능

### SKILL.md / triage-criteria.md 보강 (드라이런 발견사항)

실 데이터 검증 중 발견한 추가 규칙·세부사항. 모두 머지 전 반영됨:

- **User Feedback 조회**: `list_events`가 아닌 `list_issues(query="issue.category:feedback")` 사용
- **원문 위치**: 이슈 `description`은 Sentry AI 자동 생성 영문 요약. 분류·제목 용도로 쓰지 말고 `event.contexts.feedback.message`(원문, 대부분 한국어) 사용
- **서드파티 전용 스택 무시**: 스택 전체가 `_next-live/feedback/*` 등 라이브러리에서만 발생 시 🚫 (WEB-11 케이스에서 발견)
- **"좋을 듯" 요청 패턴**: 💡 분류 키워드 추가 (WEB-Y 케이스)
- **보정 규칙 (post-classification)**:
  - 다른 유저가 같은 요청 독립 제기 → priority 상향, Sentry duplicate 처리 (WEB-12 ≈ WEB-14)
  - 외부 실유저 제보 → priority 상향
  - 한 피드백에 여러 요청 묶임 → GH 이슈 분리 (WEB-15)

### 누락된 작업 (별도 PR 후속)

- **Sentry-GH 양방향 자동 링크**(C 옵션): 트리아지 시 매번 "이미 처리된 것" 노이즈가 올라오는 문제 해결용. 현 PR에선 보류. 별도 작업으로 분리
