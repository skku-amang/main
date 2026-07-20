# ADR-0004: 아이디어 파이프라인 SSOT — Notion Task DB + GitHub 실행층

**작성일**: 2026-07-21
**상태**: Accepted
**작성자**: 손장수

## Context

기능·개선 아이디어가 개인 메모(Google Tasks 등)에 흩어져 있어 팀이 공유·우선순위화할 곳이 없었다. "무엇을 만들지"를 모으고 평가하는 단계와, "실제로 어떻게 만드는지" 추적하는 단계를 어디서 관리할지 정해야 했다.

제약·고려 요소:

- 기획(yungs)·디자인(수연)은 비개발자로, GitHub보다 Notion 접근성이 높다. 아이디어 제안·검토의 주체다.
- 아이디어마다 우선순위를 정량적으로 매기고 자동 랭킹하고 싶다.
- 실제 구현(이슈·PR·커밋)은 이미 GitHub에서 이뤄진다.
- 같은 정보를 두 곳에 중복 관리하면 정합성이 깨진다(SSOT 위반).

## Alternatives Considered

### Option 1: Notion Task DB = 아이디어 SSOT, GitHub = 실행층 (채택)

- **장점**: 비개발자 친화. Notion formula로 우선순위 점수 자동계산. 아이디어·우선순위 = Notion, 구현 = GitHub로 층이 나뉘어 각 층에 SSOT 하나씩.
- **단점**: 진행 중 아이디어의 상태가 Notion(아이디어 상태)과 GitHub(이슈 진행)에 걸침 → 경계 규칙을 명확히 정해야 함.

### Option 2: GitHub Projects 단일화

- **장점**: 아이디어(draft issue)→이슈→PR→마일스톤이 한 도구 안. Notion↔GitHub 경계 문제가 아예 없음. 단일 SSOT.
- **단점**: GitHub Projects v2에 **formula(계산) 필드가 없어** 우선순위 자동 점수 불가. 비개발자(기획·디자인)를 GitHub로 끌어와야 해 아이디어 보드가 사장될 위험.

### Option 3: 별도 아이디어 DB 신설 (Notion)

- **장점**: 채점 컬럼을 기존 Task DB와 격리.
- **단점**: 승격 시 Task로 복사 단계가 생겨 SSOT가 둘로 쪼개짐. Notion 공식 API가 신규 DB 생성을 미지원해 수동 생성 필요.

## Decision

**Option 1** 채택. 아이디어·우선순위의 SSOT는 **Notion Task DB**, 실제 구현은 **GitHub**가 담당하는 2층 구조.

- Notion Task DB 하나에 아이디어 라이프사이클(`검토 전 → 진행 중 → 완료 / 취소`)과 ICE 채점을 담는다. 별도 DB를 만들지 않는다(Option 3 기각 — 복사 단계·SSOT 분열 회피).
- 진행 중 아이디어의 세부 태스크는 GitHub에서 관리한다. 아이디어 row ↔ **GitHub Milestone** 1:1, Milestone 안 이슈 = 세부 태스크.
- **GitHub Projects는 쓰지 않는다** — 통합 기획 보드 역할을 Notion Task DB가 이미 하고, 개발자용 "열린 이슈" 뷰는 GitHub Issues 탭 필터로 충분하다.

우선순위: 비개발자 접근성과 자동 점수(Option 2가 못 주는 것)를 경계 규칙의 복잡성보다 높게 뒀다.

운영 절차는 [how-to/manage-ideas.md](../../how-to/manage-ideas.md)에 기술한다.

## Consequences

- **좋은 결과**: 팀 전원이 Notion에서 아이디어 제안·우선순위 참여. 자동 랭킹으로 "무엇부터" 판단 용이. 구현은 GitHub 네이티브(이슈·PR·Milestone)로 유지.
- **나쁜 결과**: Notion 상태와 GitHub 진행이 걸쳐, 진행 중→완료 전이를 수동으로 맞춰야 함(Milestone 완료율을 보고 Notion을 옮김). 완전 자동 동기화는 하지 않는다.
- **중립적 결과**: 기존 [GitHub Projects 보드](https://github.com/orgs/skku-amang/projects/1)는 이 흐름에서 쓰지 않는다. 향후 스프린트·자동화가 필요해지면 재검토 대상.
