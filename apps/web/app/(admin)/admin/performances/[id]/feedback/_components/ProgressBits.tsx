import { cn } from "@/lib/utils"

/** 피드백 진행 바. 다 하면 초록, 마우스를 올리면 "한 수 / 해야 할 수" */
export const ProgressBar = ({
  done,
  total,
  label,
  className
}: {
  done: number
  total: number
  label: string
  className?: string
}) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-valuenow={done}
    title={`${done} / ${total}`}
    className={cn("h-1.5 overflow-hidden rounded-full bg-slate-200", className)}
  >
    <div
      className={cn(
        "h-full rounded-full transition-all",
        done >= total ? "bg-green-600" : "bg-blue-900"
      )}
      style={{ width: `${total === 0 ? 100 : (done / total) * 100}%` }}
    />
  </div>
)

export const RemainingBadge = ({
  count,
  unit
}: {
  count: number
  unit: string
}) => (
  <span
    className={cn(
      "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
      count > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
    )}
  >
    {count > 0 ? `${count}${unit} 남음` : "✔ 다 함"}
  </span>
)
