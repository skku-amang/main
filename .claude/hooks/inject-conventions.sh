#!/usr/bin/env bash
# PreToolUse hook: Bash 도구 사용 시 컨벤션 템플릿을 주입
# gh pr create, gh issue create, git commit 명령 감지

set -eo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo ".")"
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ "$TOOL_NAME" != "Bash" ] || [ -z "$COMMAND" ]; then
  exit 0
fi

inject_context() {
  local msg="$1"
  echo '{"decision":"approve","additionalContext":"'"$msg"'"}'
  exit 0
}

# gh pr create
if echo "$COMMAND" | grep -qE 'gh\s+pr\s+create'; then
  TEMPLATE="$ROOT/.github/PULL_REQUEST_TEMPLATE.md"
  if [ -f "$TEMPLATE" ]; then
    CONTENT=$(sed 's/"/\\"/g; s/$/\\n/' "$TEMPLATE" | tr -d '\n')
    inject_context "[컨벤션] PR 본문은 아래 템플릿 형식을 따라야 합니다:\\n${CONTENT}"
  fi
fi

# gh issue create
if echo "$COMMAND" | grep -qE 'gh\s+issue\s+create'; then
  TEMPLATES=""
  for f in "$ROOT"/.github/ISSUE_TEMPLATE/*.md; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f")
    CONTENT=$(sed 's/"/\\"/g; s/$/\\n/' "$f" | tr -d '\n')
    TEMPLATES="${TEMPLATES}\\n--- ${NAME} ---\\n${CONTENT}"
  done
  if [ -n "$TEMPLATES" ]; then
    inject_context "[컨벤션] 이슈는 아래 템플릿 중 적절한 것을 선택하여 형식을 따라야 합니다:${TEMPLATES}"
  fi
fi

# git commit
if echo "$COMMAND" | grep -qE 'git\s+commit'; then
  CONTRIBUTING="$ROOT/CONTRIBUTING.md"
  if [ -f "$CONTRIBUTING" ]; then
    # 커밋 컨벤션 섹션만 추출 (파일 끝까지 포함)
    SECTION=$(sed -n '/^## 커밋 컨벤션/,$p' "$CONTRIBUTING" | sed 's/"/\\"/g; s/$/\\n/' | tr -d '\n')
    if [ -n "$SECTION" ]; then
      inject_context "[컨벤션] 커밋 메시지는 아래 규칙을 따라야 합니다:\\n${SECTION}"
    fi
  fi
fi

exit 0