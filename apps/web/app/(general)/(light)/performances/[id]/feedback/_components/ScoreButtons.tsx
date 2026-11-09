import { FEEDBACK_SCORE_MAX, FEEDBACK_SCORE_MIN } from "@repo/shared-types"

import { cn } from "@/lib/utils"

const SCORES = Array.from(
  { length: FEEDBACK_SCORE_MAX - FEEDBACK_SCORE_MIN + 1 },
  (_, i) => FEEDBACK_SCORE_MIN + i
)

/**
 * 문항 하나의 1~5 선택. 고르는 즉시 onChange (저장은 부모가).
 * 기본 radio라 키보드 방향키로 옮겨 고를 수 있다.
 */
const ScoreButtons = ({
  name,
  label,
  value,
  disabled,
  onChange
}: {
  /** 같은 페이지의 다른 문항·팀과 겹치지 않는 radio 묶음 이름 */
  name: string
  label: string
  value: number | null
  disabled: boolean
  onChange: (score: number) => void
}) => (
  <fieldset
    disabled={disabled}
    className="flex items-center justify-between gap-3 py-1.5"
  >
    <legend className="sr-only">{label}</legend>
    <span aria-hidden className="text-sm text-slate-700">
      {label}
    </span>
    <div className="flex gap-1.5">
      {SCORES.map((score) => (
        <label
          key={score}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm tabular-nums transition-colors focus-within:ring-2 focus-within:ring-blue-900 focus-within:ring-offset-1",
            disabled && "cursor-default opacity-50",
            value === score
              ? "border-blue-900 bg-blue-900 font-semibold text-white"
              : "border-slate-300 text-slate-600 hover:border-blue-900"
          )}
        >
          <input
            type="radio"
            name={name}
            value={score}
            checked={value === score}
            onChange={() => onChange(score)}
            className="sr-only"
          />
          {score}
        </label>
      ))}
    </div>
  </fieldset>
)

export default ScoreButtons
