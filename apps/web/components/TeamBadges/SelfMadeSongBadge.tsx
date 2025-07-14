import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SelfMadeSongBadgeProps {
  className?: string
}

const SelfMadeSongBadge = ({ className }: SelfMadeSongBadgeProps) => {
  return (
    <Badge
      className={cn(
        "h-4 text-[0.7rem] font-bold lg:h-5 p-2 bg-sky-100 text-third lg:bg-neutral-200 lg:text-gray-700 lg:hover:bg-neutral-200",
        className
      )}
    >
      자작곡
    </Badge>
  )
}

export default SelfMadeSongBadge
