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
- 레포 라벨 체계가 새 prefix 방식으로 설정되어 있어야 함: `kind:*`, `priority:*`, `status:*`, `from:*`. 라벨 정의는 [CONTRIBUTING.md](../../../CONTRIBUTING.md)의 "라벨 매니페스트" 섹션 참고

## 실행 흐름

### 1. 조회 (Collector)

기본 파라미터:

- 프로젝트: `web`, `api`
- 환경: `production`
- 상태: `unresolved`
- 기간: 최근 7일

사용자가 인자로 오버라이드 가능 (예: "dev 환경 14일치"). 파라미터를 파싱해 조회 범위 조정.

**두 번 호출 — 에러 이슈와 User Feedback은 별도 쿼리**:

1. **에러 이슈**: `list_issues(query="is:unresolved environment:production lastSeen:-7d")`
2. **User Feedback**: `list_issues(query="issue.category:feedback is:unresolved")`
   - Sentry가 Feedback Widget 제출을 `category=feedback` 이슈로 저장하므로 `list_events`가 아닌 `list_issues`로 조회
   - 환경·기간 필터는 필요에 따라 추가

두 결과를 합쳐 단일 큐로 처리. Classifier는 항목의 `category`가 `feedback`이면 먼저 💡 기능 요청 기준 검사 → 버그면 일반 플로우로 분기.

각 항목에 대해 수집:

- ID, 제목, 메시지, 스택트레이스 상위 10줄(에러의 경우), 피드백 본문(feedback의 경우)
- 영향 유저 수, 이벤트 수, first_seen, last_seen
- tags: url, browser, environment, release

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

각 항목마다 `[y/n/s]` 프롬프트 (y=실행 / n=건너뜀 / s=skip all). **승인받은 항목만** 실행.

| 라벨 | 액션 |
| --- | --- |
| 🔥 | `gh issue create` — `kind: bug` + `priority: critical` + `from: sentry` 또는 `from: user-feedback`. body는 [.github/ISSUE_TEMPLATE/sentry_auto.md](../../../.github/ISSUE_TEMPLATE/sentry_auto.md) 적용. **제목은 자연어** (CC 포맷 금지) |
| 📝 | `gh issue create` — `kind: bug` + `priority: high`(영향 유저 ≥3) 또는 `priority: low` + `from:*` |
| 👀 | Sentry MCP `update_issue`로 `triaged` + `observing` 태그 부착만 |
| 🚫 | **출력만** — "Sentry 웹에서 Archive 권장" 메시지. 자동 실행 안 함 |
| 💡 | 사용자에게 대상 선택 프롬프트 (`g`=GH 이슈 / `n`=Notion / `s`=건너뜀). GH면 `kind: enhancement` + `from: user-feedback` + `priority: low`. Notion이면 `amang-notion` MCP로 아이디어 DB에 row 추가 |

### 5. 종료 요약

```
요약: 처리 완료 N건 / 보류 M건 / 실패 K건
- 🔥 N1건 → GH 이슈 #AAA, #BBB 생성됨
- 📝 N2건 → GH 이슈 #CCC~#DDD 생성됨
- 👀 N3건 → Sentry 태그 부착됨
- 🚫 N4건 → 수동 archive 권장 목록 (링크)
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
   - [g/n/s] g=GH 이슈 / n=Notion DB / s=건너뜀
~~~

## 에러 처리

- **MCP 연결 실패**: 즉시 중단, 사용자에게 원인 표시. fallback 없음.
- **GH 이슈 생성 실패**: 해당 항목만 실패 표시하고 계속 진행.
- **라벨 부재**: `kind: bug` 등이 레포에 없을 경우 "라벨 체계가 설정되지 않았습니다. [CONTRIBUTING.md의 라벨 매니페스트](../../../CONTRIBUTING.md)를 참고하여 레포에 라벨을 생성하세요." 안내 후 중단.
- **분류 판단 불가**: 👀(관찰)로 fallback.

## 드라이런 모드

사용자가 "드라이런으로", "--dry-run", "실제 실행 안 하고"를 지정하면 Actor 층의 side effect 대신 "다음 작업을 수행할 예정:" 출력만. 드라이런에서는 승인 프롬프트 생략.

## 기준 조정

분류 결과가 사용자 판단과 자주 어긋나면 [triage-criteria.md](triage-criteria.md) "조정 이력" 섹션에 케이스 기록 + 규칙 수정. 스킬 사용하며 진화시키는 문서.
