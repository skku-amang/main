import { cn } from "@/lib/utils"

interface NewcomerBadgeProps {
  className?: string
  label?: string // 기본값: "신입고정"
}

export default function NewcomerBadge({
  className,
  label = "신입고정"
}: NewcomerBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "h-10 w-32 rounded-full",
        "text-lg font-semibold",
        "bg-slate-100 text-primary",
        className
      )}
    >
      {label}
    </span>
  )
}
