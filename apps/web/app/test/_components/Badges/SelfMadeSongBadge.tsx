import { cn } from "@/lib/utils"

interface SelfMadeSongBadgeProps {
  className?: string
}

export default function SelfMadeSongBadge({
  className
}: SelfMadeSongBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "px-3 rounded-full",
        "text-sm font-semibold",
        "bg-neutral-200 text-gray-700",
        className
      )}
    >
      자작곡
    </span>
  )
}
