@AGENTS.md

## 외부 도구 컨텍스트 (Claude Code 전용)

**우선순위**: 프로젝트 전용 MCP(`amang-*` prefix)를 클라우드 커넥터(`claude_ai_*`)보다 항상 우선 사용한다. 클라우드 커넥터는 프로젝트 MCP가 없거나 연결 실패 시에만 fallback으로 사용.

- **Figma**: `hmVkj0Fq8c3dbeslIG31X9` (AMANG-New-) — MCP: `amang-figma` (Figma 공식 리모트 MCP, OAuth 인증)
- **Notion**: 아망 워크스페이스 — MCP: `amang-notion`
- **Slack**: Amang-Homepage 워크스페이스 — MCP: `amang-slack`
- **Sentry**: `amang-23` org (web, api 프로젝트) — MCP: `amang-sentry`
