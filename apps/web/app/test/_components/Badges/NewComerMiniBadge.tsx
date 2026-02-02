import { cn } from "@/lib/utils"

interface NewcomerMiniBadgeProps {
  className?: string
}

export default function NewcomerMiniBadge({
  className
}: NewcomerMiniBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "px-3 rounded-full",
        "text-sm font-semibold",
        "bg-blue-100 text-third",
        className
      )}
    >
      신입고정
    </span>
  )
}
