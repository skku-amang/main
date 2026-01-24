import { cn } from "@/lib/utils"
import { Check, Info } from "lucide-react"

type Completion = "complete" | "incomplete"

interface CompletionBadgeProps {
  state: Completion
  className?: string
  label?: string
}

const STATE_STYLE: Record<
  Completion,
  {
    wrap: string
    text: string
    icon: string
    defaultLabel: string
  }
> = {
  complete: {
    wrap: "bg-green-100",
    text: "text-green-500",
    icon: "text-white",
    defaultLabel: "Complete"
  },
  incomplete: {
    wrap: "bg-slate-200",
    text: "text-slate-500",
    icon: "text-slate-500",
    defaultLabel: "Incomplete"
  }
}

export default function CompletionBadge({
  state,
  className,
  label
}: CompletionBadgeProps) {
  const v = STATE_STYLE[state]
  const Icon = state === "complete" ? Check : Info

  return (
    <span
      className={cn(
        "inline-flex h-8 w-28 items-center justify-center gap-1 rounded-full",
        "font-semibold leading-none text-base",
        v.wrap,
        v.text,
        className
      )}
    >
      {state === "complete" ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
          <Icon className={cn("h-3 w-3", v.icon)} strokeWidth={2.5} />
        </span>
      ) : (
        <Icon className={cn("h-4 w-4", v.icon)} strokeWidth={2.5} />
      )}

      <span className="text-sm">{label ?? v.defaultLabel}</span>
    </span>
  )
}
