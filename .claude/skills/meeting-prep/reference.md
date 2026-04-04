# Notion API 레퍼런스

이 스킬이 Notion API를 사용할 때 참고할 패턴과 주의사항.

## 인증

- 토큰: 환경변수 `NOTION_TOKEN` (`.envrc.local`에서 관리)
- 토큰이 비어있으면 `direnv allow` 실행 후 재시도
- MCP Notion 서버가 연결 안 되면 `curl`로 직접 호출 가능

## API 패턴

### 검색 (DB에서 회의 페이지 찾기)

```bash
curl -s -X POST "https://api.notion.com/v1/databases/{DB_ID}/query" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "sorts": [{"property": "일시", "direction": "descending"}],
    "page_size": 2
  }'
```

### 블록 children 읽기

```bash
curl -s "https://api.notion.com/v1/blocks/{BLOCK_ID}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28"
```

### 블록 children 추가 (특정 블록 뒤에 삽입)

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/{PARENT_ID}/children" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [...],
    "after": "{BLOCK_ID_TO_INSERT_AFTER}"
  }'
```

### 블록 삭제

```bash
curl -s -X DELETE "https://api.notion.com/v1/blocks/{BLOCK_ID}" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28"
```

## 블록 타입 처리

### 토글 헤딩 (heading_3 with children)

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

### 링크가 포함된 bulleted_list_item

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
- 이 블록들은 읽기/수정 불가 — 건너뛴다
- 회의록 템플릿에 자주 나타남 (목차, 컬럼 레이아웃 등)

### has_children 블록

`has_children: true`인 블록은 children API를 별도로 호출해야 내용을 볼 수 있다.
- heading_3 토글의 실제 내용은 children에 있음
- 재귀적으로 탐색 필요 (예: bullet 안에 sub-bullet)

### 블록 ID 포맷

Notion URL의 ID는 하이픈 없는 32자 hex. API에서는 하이픈 포함 UUID 형식으로 반환된다.
- URL: `338bbc180bd6809bb161fdc83c70db18`
- API: `338bbc18-0bd6-809b-b161-fdc83c70db18`
- 둘 다 API 호출에 사용 가능

## 영역 분류 매핑

이슈/PR 라벨에서 작업 영역을 판정하는 매핑 테이블.
이 테이블은 SSOT로 여기서만 관리하며, 라벨 추가/변경 시 이 파일을 업데이트한다.

| 라벨 | 영역 |
|---|---|
| `scope: frontend` | 프론트 |
| `scope: backend` | 백엔드 |
| `scope: infra` | 인프라 |
| `scope: design` | 디자인 |
| `scope: planning` | 기획 |
| (라벨 없음) | 제목 키워드로 추정, 불확실 시 "기타" |
| (복수 라벨) | 첫 번째 scope 라벨 기준, 나머지는 부기 |
