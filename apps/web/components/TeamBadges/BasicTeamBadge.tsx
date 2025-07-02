import { cn } from "@/lib/utils"
import { Badge } from "@repo/ui/badge"

interface FreshmenFixedBadgeProps {
  className?: string
  content: "신입고정" | "자작곡"
  size: "small" | "large"
}

const BasicTeamBadge = ({ className, content }: FreshmenFixedBadgeProps) => {
  return (
    <Badge
      className={cn(
        className,
        "lg:text-md h-5 bg-blue-100 p-2 text-[10px] text-third hover:bg-blue-100 lg:h-10 lg:rounded-full lg:px-4 lg:py-1"
      )}
    >
      <span className="me-2 hidden font-extrabold lg:block">●</span>
      {content}
    </Badge>
  )
}

export default BasicTeamBadge
