# 문서 작성 규칙

> **For**: `docs/`에 새 문서를 쓰거나 기존 문서를 정비하는 사람 (인간·AI).
> **You'll be able to**: 새 문서를 어느 칸에 두고 어떻게 쓸지 정한다.

새 문서를 쓰기 전 한 번 읽고, 모호할 때 다시 본다.

## 1. Diátaxis 4분할

[Diátaxis](https://diataxis.fr)는 문서를 **읽는 사람의 의도**에 따라 4칸으로 나눈다.

| 칸 | 의도 | AMANG 예시 |
| --- | --- | --- |
| **Tutorial** | "처음이라 손잡고 배우고 싶다" | [tutorials/getting-started.md](../tutorials/getting-started.md) |
| **How-to** | "X를 어떻게 하지?" | [how-to/contributing.md](./contributing.md), 본 문서 |
| **Reference** | "X의 정확한 정의·규격은?" | [reference/glossary.md](../reference/glossary.md), [reference/commands.md](../reference/commands.md) |
| **Explanation** | "왜 이렇게 됐지?" | [explanation/team.md](../explanation/team.md), [explanation/adr/](../explanation/adr/) |

**한 문서 = 한 칸.** 두 칸이 섞이면 읽는 사람이 길을 잃는다 (예: 배포 절차를 읽다 갑자기 인프라 선택 이유가 나옴 — How-to를 원했는데 Explanation을 읽게 됨). 한 파일이 두 의도에 걸치면 나눈다.

## 2. 문서 상단 메타데이터 (권장)

문서 맨 위에 1차 독자와 얻는 것을 2줄로 밝히면 좋다. 이 두 줄을 못 쓰겠으면 → 그 문서 자체가 모호하다는 신호.

```markdown
> **For**: <누가 읽나>.
> **You'll be able to**: <읽고 나면 무엇을 할 수 있나>.
```

## 3. 문서 간 링크는 마크다운으로

다른 문서를 본문에서 가리킬 때 plain text 경로 금지, 항상 마크다운 링크.

- ✅ `[용어집](../reference/glossary.md)`
- ❌ `docs/reference/glossary.md 참조`

**왜**: docs-lint의 lychee가 마크다운 링크·URL만 깨짐 검사한다. plain text 경로는 파일이 옮겨져도 자동 검출이 안 돼 stale 링크가 남는다.

## 4. 중복하지 말고 참조

이미 SSOT가 있는 내용은 복붙하지 말고 링크한다.

- **이슈·브랜치·PR·커밋 규칙**: [CONTRIBUTING.md](../../CONTRIBUTING.md) (= [how-to/contributing.md](./contributing.md))
- **외부 도구(Figma·Notion·Slack·Sentry 등) 계정·연동**: 루트 [CLAUDE.md](../../CLAUDE.md)의 외부 도구 컨텍스트 섹션
- **도메인 용어 정의**: [reference/glossary.md](../reference/glossary.md)

## 5. ADR 작성

**ADR(Architecture Decision Record)**은 시스템 설계 결정을 영구 기록하는 짧은 문서다. PR 코멘트에 묻혀 사라지던 "왜 이렇게 했나"를 추적 가능하게 한다.

**언제 쓰나** (하나라도 해당 시):

- 되돌리기 어려운 결정 (DB 스키마, 외부 의존성 도입, public API 형태)
- 두 옵션 사이 명시적 선택 (예: 쿠키 vs localStorage 인증)
- 코드만 봐선 "왜"를 알 수 없는 결정

**쓸 필요 없음**: 명백한 베스트 프랙티스, 코드가 self-documenting한 결정.

**형식**: [explanation/adr/_template.md](../explanation/adr/_template.md) 복사해 사용. 파일명 `<번호>-<kebab-case-제목>.md`, 번호는 4자리 zero-padded 작성 순서(영구). 상태는 `Proposed → Accepted → (Superseded by ADR-YYYY | Deprecated)`.

## 6. 디렉토리 구조

`docs/` 아래 4칸(`tutorials/`·`how-to/`·`reference/`·`explanation/`) + 진입점 [docs/README.md](../README.md). ADR은 `explanation/adr/`, 설계 명세·계획은 `explanation/design/`. 파일 목록은 GitHub UI가 자동 표시하므로 인덱스를 손으로 유지하지 않는다.

## 7. 자동 검증

`.md` 변경 PR은 [docs-lint 워크플로](../../.github/workflows/docs-lint.yml)가 검사한다.

- **markdownlint** — 마크다운 형식 (룰: [.markdownlint.jsonc](../../.markdownlint.jsonc))
- **lychee** — 깨진 링크 (설정: [lychee.toml](../../lychee.toml), 인증 wall 제외: [.lycheeignore](../../.lycheeignore))
