import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"

type PassFail = "pass" | "fail"

interface PassFailBadgeProps {
  state: PassFail
  className?: string
  label?: string
}

const STATE_STYLE: Record<
  PassFail,
  {
    wrap: string
    text: string
    icon: string
    defaultLabel: string
  }
> = {
  pass: {
    wrap: "bg-green-100",
    text: "text-green-500",
    icon: "text-white",
    defaultLabel: "Pass"
  },
  fail: {
    wrap: "bg-rose-50",
    text: "text-destructive",
    icon: "text-destructive",
    defaultLabel: "Fail"
  }
}

export default function PassFailBadge({
  state,
  className,
  label
}: PassFailBadgeProps) {
  const v = STATE_STYLE[state]
  const Icon = state === "pass" ? Check : AlertCircle

  return (
    <span
      className={cn(
        "inline-flex h-8 w-28 items-center justify-center gap-1.5 rounded-full",
        "font-semibold leading-none text-base",
        v.wrap,
        v.text,
        className
      )}
    >
      {state === "pass" ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
          <Icon className={cn("h-3 w-3", v.icon)} strokeWidth={2.5} />
        </span>
      ) : (
        <Icon className={cn("h-4 w-4", v.icon)} strokeWidth={2.5} />
      )}

      <span>{label ?? v.defaultLabel}</span>
    </span>
  )
}
