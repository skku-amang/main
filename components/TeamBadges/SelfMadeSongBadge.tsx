import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SelfMadeSongBadgeProps {
  className?: string
}

const SelfMadeSongBadge = ({ className }: SelfMadeSongBadgeProps) => {
  return (
    <Badge className={cn("bg-neutral-200 text-gray-700 hover:bg-neutral-200 h-5", className)}>
      자작곡
    </Badge>
  )
}

export default SelfMadeSongBadge