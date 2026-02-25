#!/bin/bash
# Usage: ./scripts/create-worktree.sh <worktree-name> [branch-name]
# Example: ./scripts/create-worktree.sh my-feature feat/my-feature

set -e

MAIN="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:?Usage: $0 <worktree-name> [branch-name]}"
BRANCH="${2:-feat/$NAME}"
WT="$MAIN/.worktrees/$NAME"

echo "Creating worktree: $WT (branch: $BRANCH)"
git worktree add "$WT" -b "$BRANCH"

# Symlink .env files from main
ENV_FILES=(apps/api/.env apps/web/.env apps/web/.env.local packages/database/.env)
for f in "${ENV_FILES[@]}"; do
  if [ -f "$MAIN/$f" ]; then
    mkdir -p "$(dirname "$WT/$f")"
    ln -sf "$MAIN/$f" "$WT/$f"
    echo "  Linked $f"
  fi
done

# Generate Prisma client
echo "Generating Prisma client..."
cd "$WT/packages/database" && npx prisma generate --quiet

# Install dependencies
echo "Installing dependencies..."
cd "$WT" && pnpm install --quiet

echo "Done! cd .worktrees/$NAME"
