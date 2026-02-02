import { cn } from "@/lib/utils"

type ActiveInactive = "active" | "inactive"
type ActiveInactiveSize = "base" | "lg"

interface ActiveInactiveBadgeProps {
  state: ActiveInactive
  size?: ActiveInactiveSize
  className?: string
  label?: string
}

const SIZE_STYLE: Record<
  ActiveInactiveSize,
  { wrap: string; dot: string; text: string }
> = {
  base: {
    wrap: "h-8 w-28 rounded-full",
    dot: "h-2.5 w-2.5",
    text: "text-base"
  },
  lg: { wrap: "h-10 px-6 rounded-full", dot: "h-4 w-4", text: "text-lg" }
}

const STATE_STYLE: Record<
  ActiveInactive,
  { wrap: string; dot: string; text: string; defaultLabel: string }
> = {
  active: {
    wrap: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-600",
    defaultLabel: "Active"
  },
  inactive: {
    wrap: "bg-rose-50",
    dot: "bg-red-400",
    text: "text-destructive",
    defaultLabel: "Inactive"
  }
}

export default function ActiveInactiveBadge({
  state,
  size = "base",
  className,
  label
}: ActiveInactiveBadgeProps) {
  const s = SIZE_STYLE[size]
  const v = STATE_STYLE[state]

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-2.5 font-semibold leading-none",
        s.wrap,
        v.wrap,
        v.text,
        className
      )}
    >
      <span className={cn("rounded-full", s.dot, v.dot)} />
      <span className={cn(s.text)}>{label ?? v.defaultLabel}</span>
    </span>
  )
}
