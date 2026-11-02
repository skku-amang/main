import { FEEDBACK_SCORE_MAX, FEEDBACK_SCORE_MIN } from "@repo/shared-types"

import { cn } from "@/lib/utils"

const SCORES = Array.from(
  { length: FEEDBACK_SCORE_MAX - FEEDBACK_SCORE_MIN + 1 },
  (_, i) => FEEDBACK_SCORE_MIN + i
)

/** 문항 하나의 1~5 버튼. 누르는 즉시 onChange (저장은 부모가) */
const ScoreButtons = ({
  label,
  value,
  disabled,
  onChange
}: {
  label: string
  value: number | null
  disabled: boolean
  onChange: (score: number) => void
}) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-sm text-slate-700">{label}</span>
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          disabled={disabled}
          onClick={() => onChange(score)}
          className={cn(
            "size-9 rounded-full border text-sm tabular-nums transition-colors disabled:opacity-50",
            value === score
              ? "border-blue-900 bg-blue-900 font-semibold text-white"
              : "border-slate-300 text-slate-600 hover:border-blue-900"
          )}
        >
          {score}
        </button>
      ))}
    </div>
  </div>
)

export default ScoreButtons
