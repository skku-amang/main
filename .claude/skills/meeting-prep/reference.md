# Notion 블록 구조 레퍼런스

Notion MCP 도구로 블록을 작성할 때 참고할 JSON 구조.

## 토글 헤딩 (heading_3 with children)

```json
{
  "type": "heading_3",
  "heading_3": {
    "is_toggleable": true,
    "rich_text": [{"type": "text", "text": {"content": "@손장수 "}}],
    "children": [
      {
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [
            {"type": "text", "text": {"content": "✅ 작업 제목 ("}},
            {"type": "text", "text": {"content": "#365", "link": {"url": "https://github.com/skku-amang/main/issues/365"}}},
            {"type": "text", "text": {"content": ")"}}
          ]
        }
      }
    ]
  }
}
```

## 링크가 포함된 bulleted_list_item

```json
{
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [
      {"type": "text", "text": {"content": "항목 제목 ("}},
      {"type": "text", "text": {"content": "#123", "link": {"url": "https://github.com/skku-amang/main/issues/123"}}},
      {"type": "text", "text": {"content": " → "}},
      {"type": "text", "text": {"content": "PR #456", "link": {"url": "https://github.com/skku-amang/main/pull/456"}}},
      {"type": "text", "text": {"content": ")"}}
    ]
  }
}
```

## 주의사항

### unsupported 블록

Notion API가 지원하지 않는 블록 타입 (예: synced_block, column_list 등)은 `"type": "unsupported"`로 반환된다.
- 읽기/수정 불가 — 건너뛴다
- 회의록 템플릿에 자주 나타남 (목차, 컬럼 레이아웃 등)

### has_children 블록

`has_children: true`인 블록은 `mcp__notion__API-get-block-children`으로 별도 조회해야 내용을 볼 수 있다.
- heading_3 토글의 실제 내용은 children에 있음
- 재귀적으로 탐색 필요 (예: bullet 안에 sub-bullet)

### 블록 ID 포맷

Notion URL의 ID는 하이픈 없는 32자 hex. API에서는 하이픈 포함 UUID 형식으로 반환된다.
- URL: `338bbc180bd6809bb161fdc83c70db18`
- API: `338bbc18-0bd6-809b-b161-fdc83c70db18`
- 둘 다 사용 가능
