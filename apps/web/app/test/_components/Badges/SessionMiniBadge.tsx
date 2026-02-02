// SessionsBadge.tsx
import { cn } from "@/lib/utils"

interface SessionsBadgeProps {
  label: string
  className?: string
}

export default function SessionMiniBadge({
  label,
  className
}: SessionsBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-7 px-2",
        "rounded-lg",
        "bg-neutral-200 text-black",
        "text-[16px] font-base leading-none",
        className
      )}
    >
      {label}
    </span>
  )
}
