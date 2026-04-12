#!/usr/bin/env bash
# migrate-old-labels.sh — 기존 type:/scope:/v0 라벨 제거.
# 이슈는 type: → kind: 매핑 후 제거. PR은 단순 제거 (제목이 SSOT).
# 주의: 되돌릴 수 없음. 실행 전 사용자 확인 받을 것.
set -euo pipefail

REPO="skku-amang/main"

# 이슈 전용 매핑 (type: → kind:). PR은 이 매핑 건너뜀.
declare -A TYPE_TO_KIND=(
  ["type: fix"]="kind: bug"
  ["type: feat"]="kind: enhancement"
  ["type: refactor"]="kind: task"
  ["type: docs"]="kind: task"
  ["type: chore"]="kind: task"
  ["type: test"]="kind: task"
)

# 제거 대상 (모두)
OLD_LABELS=(
  "type: chore" "type: docs" "type: feat" "type: fix" "type: refactor" "type: test"
  "scope: frontend" "scope: backend" "scope: infra"
  "v0"
)

echo "⚠️  다음 라벨이 제거됩니다:"
printf '  - %s\n' "${OLD_LABELS[@]}"
echo ""
echo "이슈에 한해 type: 라벨은 다음과 같이 kind:로 매핑됩니다:"
for k in "${!TYPE_TO_KIND[@]}"; do
  echo "  - $k → ${TYPE_TO_KIND[$k]}"
done
echo "(PR은 매핑 없이 단순 제거 — 제목이 SSOT)"
echo ""
read -p "계속하시겠습니까? [y/N] " confirm
[[ "$confirm" == "y" ]] || { echo "취소됨."; exit 0; }

for label in "${OLD_LABELS[@]}"; do
  if ! gh label list --repo "$REPO" --limit 200 --json name -q '.[].name' | grep -Fxq "$label"; then
    echo "skip (없음): $label"
    continue
  fi

  new_kind="${TYPE_TO_KIND[$label]:-}"

  # 이슈 처리: 매핑이 있으면 kind: 추가 후 제거, 없으면 단순 제거
  echo "Processing issues with '$label'..."
  gh issue list --repo "$REPO" --label "$label" --state all --limit 500 \
    --json number -q '.[].number' | while read -r n; do
    if [[ -n "$new_kind" ]]; then
      gh issue edit "$n" --repo "$REPO" \
        --add-label "$new_kind" --remove-label "$label" >/dev/null
    else
      gh issue edit "$n" --repo "$REPO" --remove-label "$label" >/dev/null
    fi
  done

  # PR 처리: 단순 제거만 (매핑 없음)
  echo "Removing '$label' from PRs..."
  gh pr list --repo "$REPO" --label "$label" --state all --limit 500 \
    --json number -q '.[].number' | while read -r n; do
    gh pr edit "$n" --repo "$REPO" --remove-label "$label" >/dev/null
  done

  gh label delete "$label" --repo "$REPO" --yes
  echo "deleted: $label"
done
echo "Done."
