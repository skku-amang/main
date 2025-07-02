import { cn } from "@/lib/utils"
import { Badge } from "@repo/ui/badge"

interface SelfMadeSongBadgeProps {
  className?: string
}

const SelfMadeSongBadge = ({ className }: SelfMadeSongBadgeProps) => {
  return (
    <Badge
      className={cn(
        "h-4 bg-sky-100 p-2 text-[0.7rem] font-bold text-third lg:h-5 lg:bg-neutral-200 lg:text-gray-700 lg:hover:bg-neutral-200",
        className
      )}
    >
      자작곡
    </Badge>
  )
}

export default SelfMadeSongBadge
