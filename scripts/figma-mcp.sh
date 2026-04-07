#!/usr/bin/env bash
# figma-developer-mcp를 Node v22로 실행하는 래퍼 스크립트
# Node v24에서 ESM 호환성 문제가 있어 v22 LTS 필요
# 사용법: setup.sh 실행 후 자동 설정됨

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# .envrc.local에서 FIGMA_API_KEY 로드
if [ -z "${FIGMA_API_KEY:-}" ] && [ -f "$PROJECT_ROOT/.envrc.local" ]; then
  set -a
  source "$PROJECT_ROOT/.envrc.local"
  set +a
fi

if [ -z "${FIGMA_API_KEY:-}" ]; then
  echo "ERROR: FIGMA_API_KEY가 설정되지 않았습니다. .envrc.local을 확인해주세요." >&2
  exit 1
fi

# nvm으로 설치된 Node v22 찾기
NODE22_DIR="${NVM_DIR:-$HOME/.nvm}/versions/node"
NODE22_BIN=""

for dir in "$NODE22_DIR"/v22.*/bin; do
  [ -x "$dir/node" ] && NODE22_BIN="$dir"
done

if [ -z "$NODE22_BIN" ]; then
  echo "ERROR: Node.js v22가 필요합니다. 'nvm install 22'로 설치해주세요." >&2
  exit 1
fi

BIN_JS="$NODE22_BIN/../lib/node_modules/figma-developer-mcp/dist/bin.js"

if [ ! -f "$BIN_JS" ]; then
  echo "ERROR: figma-developer-mcp가 Node v22에 설치되어 있지 않습니다." >&2
  echo "  nvm use 22 && npm install -g figma-developer-mcp && nvm use default" >&2
  exit 1
fi

exec "$NODE22_BIN/node" "$BIN_JS" "$@"
