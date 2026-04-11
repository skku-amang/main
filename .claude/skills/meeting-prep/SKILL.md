---
name: meeting-prep
description: 직전 회의 이후 GitHub 이슈/PR, Sentry 에러를 수집하고 회의록 초안을 생성한다. 회의록 작성, 회의 준비, meeting prep 요청 시 사용.
disable-model-invocation: true
argument-hint: "[이전 회의 노션 URL (생략 시 자동 탐색)]"
---

# meeting-prep — 회의록 초안 생성 스킬

직전 회의 이후부터 현재까지의 활동을 수집하여 회의록 초안을 생성한다.

- Notion 블록 구조 레퍼런스: [reference.md](reference.md)
- 출력 형식 및 few-shot 예시: [examples/output.md](examples/output.md)

## 프로젝트 상수

- **Notion 회의록 DB**: `29a779af-a9b3-44a1-954a-bc780abc9cfc` (이름: "일정")
- **GitHub 레포**: `skku-amang/main`
- **Sentry org**: `amang-23` (프로젝트: web, api)
- **작업 영역 분류**: 기획, 디자인, 프론트, 백엔드, 인프라

## 실행 단계

### 1단계: 호출자 정보 확인

- `gh api user --jq .login`으로 GitHub 사용자명 확인
- 이 사용자가 작성한 이슈/PR만 수집 대상

### 2단계: 직전 회의 탐색

`$ARGUMENTS`에 노션 URL이 있으면 해당 페이지 사용. 없으면:

1. `mcp__amang-notion__API-query-data-source`로 회의록 DB(`29a779af-a9b3-44a1-954a-bc780abc9cfc`)를 `일시` 내림차순으로 쿼리
2. 가장 최근 2개 페이지 가져오기 (직전 회의 = 두 번째, 현재 회의 = 첫 번째)
3. `mcp__amang-notion__API-retrieve-a-page`로 직전 회의의 `일시` 속성에서 날짜 추출 → 수집 시작일
4. 직전 회의의 제목에서 차수(N차) 추출 → 이행 상황 표시에 사용

### 3단계: 직전 회의 작업 분배 파싱

`mcp__amang-notion__API-get-block-children`으로 직전 회의 페이지의 블록을 가져온다.
`# 작업 분배` 섹션을 찾아 하위 블록을 파싱:
- 호출자에게 분배된 작업 영역별(프론트, 백엔드, 인프라 등) 항목 추출
- `has_children: true`인 블록은 재귀적으로 children 조회
- 각 항목을 이후 수집 결과와 교차 매핑하여 이행 여부(✅ 완료 / 🔧 진행 중 / ⏸️ 미착수) 판정

### 4단계: 데이터 수집 (병렬)

**반드시 서브에이전트 3개를 병렬로 실행한다.** 서브에이전트에는 아래 정보를 전달:
- 수집 기간 (시작일 ~ 오늘)
- GitHub 사용자명
- 프로젝트 컨벤션: 이슈 라벨로 영역 분류 (`scope: frontend` → 프론트, `scope: backend` → 백엔드, `scope: infra` → 인프라)

#### 에이전트 A: GitHub Issues

```
gh issue list --repo skku-amang/main --state all \
  --search "author:{사용자명} created:{시작일}..{오늘}" \
  --json number,title,state,labels,createdAt,closedAt --limit 100
```

수집 필드: 번호, 제목, 상태(OPEN/CLOSED), 라벨(영역+유형), 생성일, 종료일

#### 에이전트 B: GitHub PRs

```
gh pr list --repo skku-amang/main --state all \
  --search "author:{사용자명} created:{시작일}..{오늘}" \
  --json number,title,state,labels,createdAt,mergedAt --limit 100
```

수집 필드: 번호, 제목, 상태(OPEN/MERGED/CLOSED), 라벨, 생성일, 머지일

이슈-PR 매핑: PR 본문이나 제목에서 `#이슈번호` 참조를 추출하여 연결

#### 에이전트 C: Sentry 에러

`mcp__amang-sentry__search_issues`로 web, api 프로젝트의 이슈 검색.

수집 필드: 이슈 ID, 에러 제목, 프로젝트(web/api), 이벤트 수, 상태(resolved/unresolved), 담당자
해결된 이슈는 관련 PR 번호 매핑 시도 (커밋 메시지, PR 제목에서 Sentry 이슈 ID 검색)

### 5단계: 분류 및 중복 제거

수집된 데이터를 회의록 구조에 맞게 분류:

#### 영역 판정

GitHub 이슈/PR의 `scope:` 라벨로 영역을 판정한다. 라벨이 SSOT이므로 별도 매핑 테이블 없이 라벨 값을 그대로 사용.

#### 진행 상황 vs 논의 안건 분류
- **진행 상황**: CLOSED 이슈, MERGED PR, 진행 중(OPEN PR이 있는 이슈), 미착수(직전 회의 분배 항목 중 이슈/PR 없음)
- **논의 안건**: 진행 상황에 포함되지 않은 OPEN 이슈 (새 제안, 의사결정 필요 항목)
- 동일 항목이 양쪽에 중복되면 **진행 상황에만** 남김

### 6단계: 출력 생성

[examples/output.md](examples/output.md)의 형식과 규칙을 **정확히** 따른다.

핵심 규칙:
- **테이블 형식 사용**: `heading_3` 토글 안에 `table` 블록으로 항목 표시
- **진행 상황 컬럼**: `#` | `내용` | `진행` | `중요도` | `링크` | `상세` (table_width=6)
- **논의 안건 컬럼**: `#` | `내용` | `중요도` | `링크` | `상세` (table_width=5, 진행 컬럼 없음)
- **Sentry 컬럼**: `상태` | `에러` | `프로젝트` | `이벤트` | `링크` | `처리` (table_width=6, 토글 없이 직접 table)
- **중요도 기준**: 🔴 높음(Sentry·보안·미이행) / 🟡 보통(버그·진행 중·배포) / ⚪ 낮음(chore·리팩토링·제안)
- **진행 아이콘**: ✅ 완료, 🔧 진행 중, ⏸️ 미착수, ⚠️ 미해결
- **정렬**: ✅ → 🔧 → ⏸️ 순서
- **링크 컬럼**: 이슈/PR 번호에 클릭 가능한 link 속성 필수, `#이슈 → PR #번호` 형태
- **상세 컬럼**: 직전 분배 부기(`← N차 분배`), 상태 비고(OPEN 등), 한줄 설명
- **빈 셀 처리**: 빈 셀도 `[{"type": "text", "text": {"content": ""}}]`로 채울 것 (400 에러 방지)
- **1회 호출로 토글+테이블 생성**: `heading_3.children`에 `table`을 직접 포함하여 한 번에 생성

### 7단계: 사용자 확인

출력 결과를 사용자에게 보여주고 확인을 받는다.
- 분류가 잘못된 항목이 있는지
- 추가할 논의 안건이나 특이사항이 있는지
- 참고 문서 링크를 추가할 섹션이 있는지

**노션에 작성하기 전에 반드시 사용자 승인을 받는다.**

### 8단계: 노션 작성 (승인 후)

사용자가 승인하면 Notion MCP 도구로 현재 회의 페이지에 작성:

- `mcp__amang-notion__API-patch-block-children`으로 블록 추가
- 각 영역별 `heading_2` 뒤에 `heading_3` 토글(children에 `table` 포함)을 **1회 호출로** 삽입
- `heading_3.children[0]`이 `table`, `table.children`이 `table_row` 배열
- 모든 `table_row.cells` 배열 길이는 `table_width`와 정확히 일치해야 함
- 빈 셀도 `[{"type": "text", "text": {"content": ""}}]`로 채움 (빈 배열·null 금지)
- 이슈/PR 링크는 Notion rich text의 `link` 속성 사용
- `@멘션`은 가능하면 Notion user mention 사용, 불가하면 plain text `@이름`
- 특정 블록 뒤에 삽입할 때는 `after` 파라미터 사용
- Sentry 테이블은 토글 없이 `heading_2` 바로 아래에 `table` 직접 삽입
- 각 섹션(진행 상황/논의 안건/특이사항)을 **병렬 서브에이전트**로 동시 작성하여 속도 최적화

## 주의사항

- Notion MCP 서버가 연결 안 되면 환경변수 로드 확인 (`direnv allow`) 후 세션 재시작. 재시작 후에도 안 되면 사용자에게 알림
- Notion API에서 `unsupported` 블록은 건너뛰고, `has_children: true`인 블록은 `mcp__amang-notion__API-get-block-children`으로 재귀 탐색
- Sentry MCP 도구 권한 오류 시 `search_issues`만으로 수집 가능
- 회의록 DB에 현재 회의 페이지가 아직 없으면 사용자에게 생성 요청
