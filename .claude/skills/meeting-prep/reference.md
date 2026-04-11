# Notion 블록 구조 레퍼런스

Notion MCP 도구로 블록을 작성할 때 참고할 JSON 구조.

## 토글 헤딩 + 테이블 (heading_3 with table children)

진행 상황·논의 안건 각 영역별 `@이름` 토글 안에 테이블을 넣는 구조.

```json
{
  "type": "heading_3",
  "heading_3": {
    "is_toggleable": true,
    "rich_text": [{"type": "text", "text": {"content": "@손장수 "}}],
    "children": [
      {
        "type": "table",
        "table": {
          "table_width": 6,
          "has_column_header": true,
          "has_row_header": false,
          "children": [
            {
              "type": "table_row",
              "table_row": {
                "cells": [
                  [{"type": "text", "text": {"content": "#"}}],
                  [{"type": "text", "text": {"content": "내용"}}],
                  [{"type": "text", "text": {"content": "진행"}}],
                  [{"type": "text", "text": {"content": "중요도"}}],
                  [{"type": "text", "text": {"content": "링크"}}],
                  [{"type": "text", "text": {"content": "상세"}}]
                ]
              }
            },
            {
              "type": "table_row",
              "table_row": {
                "cells": [
                  [{"type": "text", "text": {"content": "1"}}],
                  [{"type": "text", "text": {"content": "모바일 예약 FAB 버튼"}}],
                  [{"type": "text", "text": {"content": "✅"}}],
                  [{"type": "text", "text": {"content": "⚪"}}],
                  [{"type": "text", "text": {"content": "PR #409", "link": {"url": "https://github.com/skku-amang/main/pull/409"}}}],
                  [{"type": "text", "text": {"content": "← 5차 분배"}}]
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

### 테이블 셀 내 다중 링크

하나의 셀에 이슈→PR 연결을 표현할 때:

```json
"cells": [
  [
    {"type": "text", "text": {"content": "#445", "link": {"url": "https://github.com/skku-amang/main/issues/445"}}},
    {"type": "text", "text": {"content": " → "}},
    {"type": "text", "text": {"content": "PR #449", "link": {"url": "https://github.com/skku-amang/main/pull/449"}}}
  ]
]
```

## 지원 블록 타입

`mcp__amang-notion__API-patch-block-children`의 JSON Schema는 `paragraph`과 `bulleted_list_item`만 명시하지만, 실제로는 아래 타입도 정상 동작한다 (2026-04-11 검증):

- `heading_1`, `heading_2`, `heading_3` (생성 확인)
- `heading_3` + `is_toggleable: true` + `children` (토글 헤딩 + 자식 블록 일괄 생성)
- `rich_text` 내 `mention` 타입 (`{"type": "mention", "mention": {"type": "user", "user": {"id": "..."}}}`)
- `rich_text` 내 `link` 속성 (`{"type": "text", "text": {"content": "#123", "link": {"url": "..."}}}`)
- `divider`
- `table` + `table_row` (테이블 생성, `has_column_header`/`has_row_header` 지원, 셀 내 링크 가능)
- 토글 헤딩 children으로 `table` 삽입 (토글 안에 테이블 가능)

**별도 테스트 없이 바로 사용할 것.** Schema 검증은 MCP 서버가 Notion API로 passthrough하므로 실패하지 않는다.

## 주의사항

### 중첩 블록 생성 시 400 에러 방지

Notion API는 **2단계까지** 중첩 생성을 지원한다: `heading_3(토글) > table > table_row`. 하지만 다음 경우 400 에러가 발생할 수 있다:

1. **table_row의 cells 수 ≠ table_width**: `table_width: 6`이면 모든 row의 cells 배열이 정확히 6개여야 한다. 빈 셀은 `[{"type": "text", "text": {"content": ""}}]`로 채운다.
2. **빈 cells 배열**: `cells: [[]]`는 에러. 최소 `[{"type": "text", "text": {"content": ""}}]` 필요.
3. **children 없는 table**: `table` 블록에는 최소 1개의 `table_row` children이 필요하다.
4. **heading_3 토글에 테이블을 넣을 때**: `heading_3.children` 안에 `table`을 직접 넣는 1회 호출 방식이 가장 안정적. 토글을 먼저 만들고 나중에 table을 append하면 2회 호출이 되어 비효율적이고 ordering 이슈가 생길 수 있다.
5. **rich_text 배열이 비어있으면 에러**: 셀에 내용이 없어도 빈 문자열 text 객체를 넣어야 한다.

### unsupported 블록

Notion API가 지원하지 않는 블록 타입 (예: synced_block, column_list 등)은 `"type": "unsupported"`로 반환된다.
- 읽기/수정 불가 — 건너뛴다
- 회의록 템플릿에 자주 나타남 (목차, 컬럼 레이아웃 등)

### has_children 블록

`has_children: true`인 블록은 `mcp__amang-notion__API-get-block-children`으로 별도 조회해야 내용을 볼 수 있다.
- heading_3 토글의 실제 내용은 children에 있음
- 재귀적으로 탐색 필요 (예: bullet 안에 sub-bullet)

### 블록 ID 포맷

Notion URL의 ID는 하이픈 없는 32자 hex. API에서는 하이픈 포함 UUID 형식으로 반환된다.
- URL: `338bbc180bd6809bb161fdc83c70db18`
- API: `338bbc18-0bd6-809b-b161-fdc83c70db18`
- 둘 다 사용 가능
