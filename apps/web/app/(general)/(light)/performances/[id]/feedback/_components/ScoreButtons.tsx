import { FEEDBACK_SCORE_MIN } from "@repo/shared-types"

import { cn } from "@/lib/utils"

/**
 * 문항 하나의 점수 선택. 고르는 즉시 onChange (저장은 부모가).
 * 기본 radio라 키보드 방향키로 옮겨 고를 수 있다.
 * 휴대폰에서는 10개를 한 줄에 넣으면 누르기 어려워 5개씩 두 줄로 놓는다.
 */
const ScoreButtons = ({
  name,
  label,
  hint,
  max,
  value,
  disabled,
  onChange
}: {
  /** 같은 페이지의 다른 문항·팀과 겹치지 않는 radio 묶음 이름 */
  name: string
  label: string
  hint: string
  max: number
  value: number | null
  disabled: boolean
  onChange: (score: number) => void
}) => {
  const scores = Array.from(
    { length: max - FEEDBACK_SCORE_MIN + 1 },
    (_, i) => FEEDBACK_SCORE_MIN + i
  )

  return (
    <fieldset disabled={disabled} className="py-1.5">
      <legend className="text-sm text-slate-700">
        {label}
        <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
      </legend>
      <div className="mt-1.5 grid grid-cols-5 gap-1.5 sm:flex">
        {scores.map((score) => (
          <label
            key={score}
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm tabular-nums transition-colors focus-within:ring-2 focus-within:ring-blue-900 focus-within:ring-offset-1 sm:size-9 sm:rounded-full",
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
}

export default ScoreButtons
