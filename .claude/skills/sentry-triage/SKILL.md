---
name: sentry-triage
description: Sentry 이슈·유저 피드백을 조회하고 5단계 라벨(🔥 즉시 수정 / 📝 이슈 등록 / 👀 관찰 / 🚫 무시 / 💡 기능 요청)로 분류한 뒤 승인 게이트를 거쳐 GH 이슈 생성·Sentry 태그 부착 등 후속 액션을 자동화한다. 사용자가 "sentry 확인", "트리아지", "센트리 봐줘" 등을 말하거나 /sentry-triage 커맨드가 호출될 때 활성화한다.
---

# Sentry Triage 스킬

## 목적

Sentry의 unresolved 이슈와 User Feedback을 트리아지 프레임워크로 분류·조치한다. 단순 조회가 아니라 각 항목에 우선순위 라벨을 추천하고, 사용자 승인 후 GH 이슈 생성 / Sentry 태그 부착 / archive 추천을 수행한다.

## 전제 조건

- `amang-sentry` MCP 연결됨 (org: `amang-23`, projects: `web`, `api`)
- `gh` CLI 인증됨 (skku-amang/main 접근 권한)
- 레포 라벨 체계가 새 prefix 방식으로 설정되어 있어야 함: `kind:*`, `priority:*`, `from:*`. 라벨 정의는 [CONTRIBUTING.md](../../../CONTRIBUTING.md)의 "라벨 매니페스트" 섹션 참고

## 실행 흐름

### 1. 조회 (Collector)

기본 파라미터:

- 프로젝트: `web`, `api`
- 환경: `production`
- 상태: `unresolved`
- 기간: 최근 7일

**두 번 호출 — 에러 이슈와 User Feedback은 별도 쿼리**. `amang-sentry` MCP `list_issues`는 조회 창이 **24시간 고정**이라 그보다 조용한 이슈가 빠지므로, 24시간을 넘는 기간은 REST API로 조회한다 (토큰 `SENTRY_ACCESS_TOKEN`, `.envrc.local`):

```
GET https://sentry.io/api/0/organizations/amang-23/issues/?statsPeriod=<기간>&project=-1&query=<쿼리>
```

1. **에러 이슈**: `is:unresolved environment:production lastSeen:-7d` (`statsPeriod=14d`)
2. **User Feedback**: `issue.category:feedback is:unresolved` (`statsPeriod=90d`)
   - Sentry가 Feedback Widget 제출을 `category=feedback` 이슈로 저장하므로 `list_events`가 아닌 이슈로 조회
   - 환경·기간 필터는 필요에 따라 추가

`project=-1`은 조직 전체(현재 `web`·`api`뿐)라, 프로젝트가 늘면 응답의 `project.slug`로 거른다.

**이미 처리된 항목 대조**: 조회한 이슈의 shortId(`WEB-29` 등)로 GH 이슈 본문을 검색(`gh issue list -R skku-amang/main --state all --search "WEB-29 in:body"`)해, 이미 GH 이슈가 있으면 분류 대신 "✅ 이미 처리됨" 섹션으로 빼고 Sentry resolve 대상으로 둔다 (GH 이슈 열림·닫힘 무관 — 추적 책임이 이미 GH로 넘어감).

두 결과를 합쳐 단일 큐로 처리. Classifier는 항목의 `category`가 `feedback`이면 먼저 💡 기능 요청 기준 검사 → 버그면 일반 플로우로 분기.

**User Feedback 입구 2개** (태그로 구분):

| 입구                               | `source` 태그      | `suggestion_kind` 태그    |
| ---------------------------------- | ------------------ | ------------------------- |
| 떠 있는 의견 버튼 (Sentry 기본 폼) | `widget`           | 없음                      |
| `/suggestions` 의견 보내기 페이지  | `suggestions-page` | `bug` / `idea` / `praise` |

`suggestion_kind`는 사용자가 직접 고른 값이므로 원문 패턴 매치보다 우선한다 (분류 기준은 [triage-criteria.md](triage-criteria.md)의 "의견 보내기 태그 우선" 참고).

각 항목에 대해 수집:

- ID, 제목, 영향 유저 수, 이벤트 수, first_seen, last_seen
- tags: url, browser, environment, release
- 에러의 경우: 메시지, 스택트레이스 상위 10줄
- **User Feedback의 경우**: `event.contexts.feedback.message` 필드(= 유저가 입력한 **원문**)를 사용. 이슈 `description` 필드는 Sentry가 AI로 자동 생성한 영문 요약이므로 **분류·제목 용도로 쓰지 말 것**. 원문은 대부분 한국어

### 2. 자동 분류 (Classifier)

[triage-criteria.md](triage-criteria.md)의 분류 기준 → 보정 규칙 순으로 적용:

0. `suggestion_kind` 태그가 있으면 태그로 먼저 분기 (`praise` → 🙌 칭찬 확정, `idea` → 💡 확정, `bug` → 아래 1·2·4·5 버그 흐름, 3번 💡 검사는 건너뜀)
1. 🔥 즉시 수정 기준 매치 검사
2. 🚫 무시 기준 매치 검사
3. 💡 기능 요청 기준 검사 (User Feedback일 때만)
4. 📝 이슈 등록 기준 검사
5. 나머지는 👀 관찰
6. 보정 규칙 적용 (중복 요청·외부 실유저 → priority 상향, 여러 요청 묶임 → 이슈 분리). 중복으로 판정된 후속 Sentry 이슈는 새 GH 이슈 대신 원본 이슈에 voter 코멘트를 달고, Sentry에 `Duplicate of WEB-XX` 코멘트 후 resolve

각 분류에 **근거(어떤 시그널을 봤는지)**를 2-3줄로 첨부.

### 3. 사용자 검토

5개 섹션으로 묶어 테이블·리스트 출력 (아래 "출력 형식" 참조). 사용자는 이 시점에 라벨 수정 지시 가능:

- "3번은 관찰로 바꿔"
- "💡의 2번은 Notion 대신 GH 이슈로"

### 4. 액션 실행 (Actor, 항목별 승인 게이트)

각 항목마다 `[y/n/s]` 프롬프트 (y=실행 / n=건너뜀 / s=skip all). **승인받은 항목만** 실행.

| 라벨 | 액션                                                                                                                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔥   | `gh issue create` — `kind: bug` + `priority: critical` + `from: sentry` 또는 `from: user-feedback`. body는 [.github/ISSUE_TEMPLATE/sentry_auto.md](../../../.github/ISSUE_TEMPLATE/sentry_auto.md) 적용. **제목은 자연어** (CC 포맷 금지) |
| 📝   | `gh issue create` — `kind: bug` + `priority: high`(영향 유저 ≥3) 또는 `priority: low` + `from:*`                                                                                                                                          |
| 👀   | **별도 액션 없음** — Sentry는 unresolved 상태 유지. 다음 트리아지 라운드에 자연스레 다시 검토됨. (선택: 코멘트로 "observing - 다음 라운드 재평가" 추적 메모)                                                                              |
| 🚫   | **출력만** — "Sentry 웹에서 Archive 권장" 메시지. 자동 실행 안 함                                                                                                                                                                         |
| 💡   | 사용자에게 대상 선택 프롬프트 (`g`=GH 이슈 / `n`=Notion / `s`=건너뜀). GH면 `kind: enhancement` + `from: user-feedback` + `priority: low`. Notion이면 `amang-notion` MCP로 아이디어 DB에 row 추가                                         |
| ✅   | **이미 처리됨** (기존 GH 이슈 있음) — `[y/n]` 승인 시 Sentry에 `GitHub 이슈로 등록: skku-amang/main#N` 코멘트 후 resolve. 한 번에 묶어 승인받아도 됨                                                                                      |
| 🙌   | **이슈 생성 안 함** — 원문·페이지만 모아 출력. 승인 시 Sentry에서 resolve (팀 동기부여용 공유는 사용자 판단)                                                                                                                              |

**GH 이슈를 만든 항목은 Sentry에서 바로 resolve한다** (🔥·📝·💡-GH). 추적 책임이 GH 이슈로 넘어갔으므로, unresolved로 두면 다음 라운드 큐에 다시 섞인다. 순서: 이슈 생성 → Sentry 이슈에 `GitHub 이슈로 등록: skku-amang/main#N` 코멘트 → `status: resolved`. 같은 증상이 재발하면 Sentry가 regression으로 다시 연다.

이슈 body는 [sentry_auto.md](../../../.github/ISSUE_TEMPLATE/sentry_auto.md)의 섹션 제목을 **그대로** 써야 이슈 템플릿 훅을 통과한다 (`## 스택트레이스`, `## 재현 조건 (추정)`, `## User Feedback (있을 경우)` 포함). 의견 버튼 제보처럼 스택트레이스가 없으면 "없음 — 의견 버튼으로 받은 제보"로 채운다. Source 줄은 `[Sentry WEB-29](https://amang-23.sentry.io/issues/WEB-29)`처럼 **shortId를 글자로 포함**한다 — 다음 라운드의 기존 이슈 대조가 이 문자열로 검색한다.

### 5. 종료 요약

```
요약: 처리 완료 N건 / 보류 M건 / 실패 K건
- 🔥 N1건 → GH 이슈 #AAA, #BBB 생성됨
- 📝 N2건 → GH 이슈 #CCC~#DDD 생성됨
- 👀 N3건 → 액션 없음 (다음 라운드 재검토)
- 🚫 N4건 → 수동 archive 권장 목록 (링크)
- 💡 N5건 → GH N개, Notion N개
- ✅ 이미 처리됨 N6건 + GH 이슈로 옮긴 N7건 + 중복 N8건 → Sentry resolve
```

## 출력 형식

```markdown
## Sentry Triage (YYYY-MM-DD)

조회: web + api / unresolved — 에러 prod 7d · 의견 90d — 총 N건

### ✅ 이미 처리됨 (N건)

| Sentry | GH   | 상태   |
| ------ | ---- | ------ |
| WEB-29 | #674 | closed |

[y/n] 묶어서 Sentry resolve

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
   - [g/n/s] g=GH 이슈 / n=Notion DB / s=건너뜀

### 🙌 칭찬 (N건)

1. "동방 예약이 훨씬 편해졌어요" — /reservations/clubroom ([feedback link])
```
