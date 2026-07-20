# Sentry Triage 스킬 설계

**작성일**: 2026-04-12
**상태**: 설계 확정, 구현 대기
**작성자**: JSON (+ Claude Code 협업)

## 배경

Sentry에서 발생하는 **이슈(에러)**와 **유저 피드백**을 확인·분류·조치하는 작업이 반복적으로 수행되고 있다. 현재는 수동으로 Sentry 웹을 열어 하나씩 판단·처리하고 있으며, 기준이 암묵적이고 처리 결과 추적이 어렵다.

이를 **트리아지(triage)** 개념으로 구조화하여 Claude Code 스킬로 자동화한다. 단순 조회가 아니라 각 항목에 우선순위 라벨을 추천하고, 승인 게이트를 거쳐 GitHub 이슈 생성·Sentry 상태 변경 등의 후속 액션까지 수행한다.

피드백은 대부분 버그 제보이지만 **기능 요청**도 포함되므로, 스킬 내부에서 버그/기능 요청을 자동 분류하여 서로 다른 트랙으로 처리한다.

## 목표

1. Sentry 이슈·피드백의 트리아지 루틴을 **단일 명령**으로 자동화
2. 각 항목에 **5단계 라벨**(🔥 즉시 수정 / 📝 이슈 등록 / 👀 관찰 / 🚫 무시 / 💡 기능 요청)을 자동 추천
3. 각 라벨별 후속 액션을 **승인 게이트** 하에 자동 실행 (GH 이슈 생성, Sentry 태그 부착 등)
4. 반복 사용하며 **트리아지 기준을 명시적으로 정립**할 수 있는 문서 구조 제공
5. 선행 작업으로 **라벨 시스템 재편** (Conventional Commits와 중복되는 `type:/scope:` 제거, SSOT 확립)

## 비목표

- 🔥 즉시 수정 라벨에 대한 **자동 워크트리/브랜치 생성** (향후 확장, 현재 범위 밖)
- 🚫 무시 항목의 **자동 Archive 실행** (추천만, 실행은 수동 — 신뢰 쌓인 후 자동화)
- **다른 프로젝트로의 재사용** (현재는 amang 프로젝트 전용, YAGNI)
- **질문(question) 유형의 자동 응답** (스킬은 분류까지만)

## Phase 구성

구현은 두 단계로 나눈다.

### Phase 0: 라벨 시스템 재편

스킬이 부착할 라벨이 존재해야 하므로 선행 필수.

**삭제할 라벨**:
- `type: chore/docs/feat/fix/refactor/test` — Conventional Commits PR 제목과 중복 (SSOT 위반)
- `scope: frontend/backend/infra` — Conventional Commits scope와 중복
- `v0` — 미사용, 목적 불명

**신규 라벨**:

| Prefix | 값 | 용도 |
|---|---|---|
| `kind:` | bug / enhancement / question / task | 이슈 종류 (제목으로 파생 불가능하므로 필수) |
| `priority:` | critical / high / low | 긴급도 (3단계) |
| `status:` | needs-triage / observing / blocked / confirmed | 수명주기 |
| `from:` | sentry / user-feedback | 출처 (amang 고유 축) |
| `resolution:` | duplicate / wontfix / invalid | Close 사유 |
| (단일) | `good first issue`, `help wanted` | GitHub 표준, 오픈소스 기여 유입 |

**색상 팔레트**:
- `kind:*` → 파랑 계열 (#3B82F6~#93C5FD)
- `priority:*` → 빨강 계열 (`critical`=짙은 빨강, `low`=연한 빨강)
- `status:*` → 노랑 계열
- `from:*` → 초록 계열
- `resolution:*` → 회색 계열

**관리 방식**: 선언적(declarative) — `scripts/setup-labels.sh` 또는 `terraform-provider-github`으로 코드 관리. 수동 라벨 추가/수정 금지.

**CONTRIBUTING.md 갱신**:
- "라벨" 섹션을 `type:`/`scope:` 중심에서 `kind:` 중심으로 재작성
- PR 라벨 규칙: `priority:*`, `status:*`만 부착 (kind/from은 이슈 전용)
- 이슈 라벨 규칙: `kind:*` 필수 + 필요 시 priority/status/from

**기존 이슈/PR 마이그레이션**: 기존 `type:/scope:` 라벨이 붙은 이슈·PR은 일괄 삭제. PR 제목이 이미 Conventional Commits를 따르고 있어 정보 손실 없음.

**업계 선례 참조**:
- rust-lang/rust의 `C-*`/`P-*`/`S-*`/`A-*` prefix 체계
- supabase의 flat + priority(`p1~p4`) 혼합
- GitHub 기본 9종 라벨(`good first issue`, `help wanted` 등)

### Phase 1: Sentry Triage 스킬 구현

#### 스킬 위치 및 파일 구성

```
.claude/skills/sentry-triage/
├── SKILL.md              # 트리거, 흐름, 액션 프로토콜
├── triage-criteria.md    # 라벨 기준 (진화하는 문서)
└── issue-template.md     # GH 이슈 body 템플릿
```

**트리거**: 사용자 발화 "sentry 확인", "트리아지", 또는 명시적 스킬 호출.

#### 실행 흐름

```
1. 조회
   - amang-sentry MCP로 web, api 프로젝트에서
   - prod 환경, unresolved 상태, 최근 7일 이슈 + User Feedback 모두 조회
   - 피드백은 연결된 이슈로 정규화하여 동일한 큐에서 처리
   (기본값이며, 인자로 환경/기간 덮어쓰기 가능: /sentry-triage dev 14d 등)

2. 자동 분류 & 라벨 추천
   - 각 항목에 🔥/📝/👀/🚫 중 하나 자동 부착
   - User Feedback은 내용 분석하여 버그 vs 기능 요청 구분
     (기능 요청은 별도 💡 라벨 — 4단계와 별개 5번째 트랙)
   - 근거(어떤 시그널을 봤는지) 2-3줄로 표시

3. 사용자 검토
   - 테이블 형태로 한눈에 출력
   - 사용자는 라벨 수정 가능 (예: "3번 이슈는 관찰로 바꿔")

4. 액션 실행 (각 항목마다 승인 게이트)
   - 승인받은 항목만 실행
   - 실행 실패 시 원인 표시, 건너뜀

5. 기록 & 종료 요약
   - 처리 완료 N건 / 보류 M건 / 실패 K건
```

#### 트리아지 기준 (초기값, 사용하며 조정)

`triage-criteria.md`로 분리하여 버전 관리. 초기 값은 아래와 같다.

**🔥 즉시 수정**:
- 영향 유저 ≥ 5명, OR
- 최근 24시간 급증 (기저 대비 5배 이상), OR
- 핵심 flow 키워드 매치 (`auth`, `login`, `payment`, `reservation`, `booking` 등)

**📝 이슈 등록**:
- 재현 가능한 스택트레이스 존재
- 영향 유저 ≥ 1명
- 위 🔥 기준 미달

**👀 관찰**:
- 유저 1명, 재발 없음
- OR 판단 애매 (신규 유형이라 영향도 판단 불가)

**🚫 무시 추천**:
- 알려진 무해 에러: `ChunkLoadError`, `AbortError`, 네트워크 취소
- 봇 User-Agent
- 개발 환경 유입

**💡 기능 요청** (User Feedback 전용 5번째 라벨):
- 피드백 내용이 "추가해달라", "있으면 좋겠다" 등의 요청 패턴
- 에러가 아닌 경우

#### 액션 매트릭스

| 라벨 | 액션 | 승인 게이트 |
|---|---|---|
| 🔥 | GH 이슈 생성 (skku-amang/main, `kind:bug` + `priority:critical` + `from:sentry\|user-feedback`) | 항상 |
| 📝 | GH 이슈 생성 (`kind:bug` + `priority:high` or `low` + `from:*`) | 항상 |
| 👀 | Sentry 이슈에 `observing` 태그 부착 | 항상 |
| 🚫 | Archive **추천만 출력** (사용자가 Sentry 웹에서 수동 처리) | 해당 없음 |
| 💡 | GH 이슈 생성 (`kind:enhancement` + `from:user-feedback` + `priority:low`) **또는** Notion 아이디어 DB에 row 추가 | 항상, 대상 선택 |

**GH 이슈 생성 시 body 템플릿** (`issue-template.md`):

~~~markdown
> **Source**: [Sentry 이슈 링크](permalink)
> **영향**: 유저 N명 / 이벤트 M건 / 최근 발생: YYYY-MM-DD HH:mm

## 요약

{{에러 메시지 또는 피드백 원문}}

## 스택트레이스

```
{{요약된 스택 상단 5-10줄}}
```

## 재현 조건 (추정)

- {{URL, 브라우저, 환경 등 태그에서 추출}}

## User Feedback (있을 경우)

> {{유저 원문 인용}}

---

_이 이슈는 `sentry-triage` 스킬로 자동 생성되었습니다._
~~~

#### 출력 형식

```markdown
## Sentry Triage (2026-04-12)

조회: web + api / prod / 7d / unresolved — 총 14건

### 🔥 즉시 수정 (2건)
1. [TypeError: Cannot read 'user' of undefined](sentry-link)
   - 영향: 12명 / 최근 24h 3배 증가
   - 근거: 유저 5명↑ + 급증 패턴
   - [y/n] GH 이슈 생성 (`kind:bug priority:critical from:sentry`)

### 📝 이슈 등록 (5건)
...

### 👀 관찰 (3건)
...

### 🚫 무시 추천 (3건)
...

### 💡 기능 요청 (1건)
1. "예약 목록을 엑셀로 내보낼 수 있었으면 좋겠어요"
   - [y/n] GH 이슈 생성 vs Notion 아이디어 DB 추가 vs 건너뜀

---
요약: 처리 N건 / 보류 M건
```

## 아키텍처 / 컴포넌트 경계

스킬은 단일 프로세스 내에서 동작하지만 논리적으로 세 층으로 분리된다.

1. **Collector 층** — `amang-sentry` MCP 호출만 담당. 이슈·피드백 raw 데이터 수집.
2. **Classifier 층** — `triage-criteria.md`의 규칙을 읽어 raw 데이터를 5라벨 중 하나로 분류. 순수 함수적 로직, 외부 I/O 없음.
3. **Actor 층** — 분류 결과와 사용자 승인을 받아 GH 이슈 생성·Sentry 태그 부착 등 side effect 수행. `gh` CLI 및 Sentry MCP 사용.

각 층은 스킬 본문(SKILL.md)의 다른 섹션으로 기술되며, `triage-criteria.md` 및 `issue-template.md`는 Classifier/Actor 층이 외부에서 참조하는 데이터 파일이다.

## 데이터 흐름

```
Sentry MCP (web, api / prod / 7d / unresolved)
  ↓ 이슈 + 피드백 raw
Collector 층
  ↓ 정규화된 항목 배열
Classifier 층 (triage-criteria.md 규칙 적용)
  ↓ [라벨 + 근거] 쌍이 부착된 항목 배열
사용자 검토 (라벨 수정 가능)
  ↓ 확정된 라벨 목록
Actor 층
  ├─ gh issue create (🔥, 📝, 💡)
  ├─ Sentry MCP tag update (👀)
  └─ 출력만 (🚫)
  ↓
요약 리포트
```

## 에러 처리

- **Sentry MCP 연결 실패**: 즉시 중단, 사용자에게 원인 알림. fallback 없음 (MCP가 SSOT).
- **GH 이슈 생성 실패**: 해당 항목만 실패 표시, 나머지 계속. 실패 사유(토큰, 레이트리밋 등) 출력.
- **라벨 존재하지 않음**: Phase 0이 선행되지 않은 경우. "라벨 시스템 재편이 필요합니다" 안내 후 중단.
- **트리아지 기준 모호**: Classifier가 판단 불가 시 👀(관찰)로 fallback.

## 테스트

스킬은 대화형이라 단위 테스트가 어렵다. 대신:

- **드라이런(dry-run) 모드**: 실제 GH 이슈 생성 없이 "이런 요청을 보낼 예정" 만 출력
- **스킬 자체 검증**: `superpowers:writing-skills`의 검증 절차 적용
- **첫 주 동안 수동 검토**: 스킬이 추천한 라벨과 사용자 최종 판단을 비교, 괴리가 큰 케이스는 `triage-criteria.md` 업데이트로 피드백

## 리스크 & 완화

| 리스크 | 완화 |
|---|---|
| 트리아지 기준이 틀려 잘못된 이슈 대량 생성 | 각 액션에 승인 게이트, 🚫 자동 실행 배제, 드라이런 모드 |
| 라벨 체계 변경으로 기존 필터/뷰 깨짐 | CONTRIBUTING.md 갱신, 기존 이슈 마이그레이션 명시 |
| Sentry MCP 레이트리밋 | 7일 기간 제한, 필요 시 batch로 분할 조회 |
| User Feedback 버그/기능 분류 오류 | 오분류된 경우 사용자가 수정 가능, 누적 오류는 기준 문서 업데이트로 반영 |

## 확장 경로 (비범위, 참고용)

- 🚫 자동 Archive (신뢰 쌓인 후)
- 🔥 자동 워크트리·브랜치 생성 → 디버깅 세션 연결
- 회고용 통계 (월별 처리 분포, 라벨 추천 정확도)
- 다른 프로젝트 재사용을 위한 `.sentry-triage.yaml` config 추출
- bot 자동화(`label-actions`)로 CC prefix → 라벨 자동 부착 (cal.com 방식)

## 참고 자료

- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/)
- [rust-lang/rust 라벨 체계](https://github.com/rust-lang/rust/labels)
- [supabase/supabase 라벨 체계](https://github.com/supabase/supabase/labels)
- [GitHub 기본 라벨 문서](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
- amang 현재 라벨 현황 (`gh label list --repo skku-amang/main` 결과, 2026-04-12 기준)
