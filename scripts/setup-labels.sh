#!/usr/bin/env bash
# setup-labels.sh — skku-amang/main 레포의 라벨을 선언적으로 동기화.
# 사용법: scripts/setup-labels.sh [--dry-run]
# 참고: CONTRIBUTING.md의 라벨 규칙과 일치시킬 것 (SSOT는 이 스크립트).
set -euo pipefail

REPO="skku-amang/main"
DRY_RUN="${1:-}"

# 라벨 매니페스트: "이름|색상|설명"
LABELS=(
  # kind: (이슈 종류) — 파랑 계열
  "kind: bug|3B82F6|버그 — 작동하지 않거나 기대와 다르게 동작"
  "kind: enhancement|60A5FA|기능 추가 또는 기존 기능 개선"
  "kind: question|93C5FD|질문 — 사용법 / 안내 요청"
  "kind: task|BFDBFE|일반 작업 (리팩토링, 문서, 의존성 등)"

  # priority: — 빨강 계열
  "priority: critical|B91C1C|즉시 수정 필요 (프로덕션 장애 / 다수 영향)"
  "priority: high|DC2626|이번 스프린트 내 처리"
  "priority: low|FCA5A5|여유 있을 때 처리"

  # status: — 노랑 계열
  "status: needs-triage|FBBF24|트리아지 대기"
  "status: observing|FCD34D|재발 모니터링 중"
  "status: confirmed|FDE68A|재현 확인됨"
  "status: blocked|F59E0B|진행 불가 — 외부 의존성 대기"

  # from: (출처) — 초록 계열
  "from: sentry|10B981|Sentry 자동 유입"
  "from: user-feedback|34D399|유저 피드백"

  # resolution: (close 사유) — 회색 계열
  "resolution: duplicate|9CA3AF|중복"
  "resolution: wontfix|6B7280|수정하지 않음"
  "resolution: invalid|D1D5DB|유효하지 않음"

  # GitHub 표준 — 오픈소스 기여 유입
  "good first issue|7C3AED|첫 기여자에게 적합"
  "help wanted|8B5CF6|컨트리뷰션 환영"
)

sync_label() {
  local spec="$1"
  local name color desc
  IFS='|' read -r name color desc <<< "$spec"

  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "DRY: sync '$name' color=$color"
    return
  fi

  if gh label list --repo "$REPO" --limit 200 --json name -q '.[].name' | grep -Fxq "$name"; then
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "updated: $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "created: $name"
  fi
}

echo "Syncing ${#LABELS[@]} labels to $REPO..."
for spec in "${LABELS[@]}"; do
  sync_label "$spec"
done
echo "Done."
