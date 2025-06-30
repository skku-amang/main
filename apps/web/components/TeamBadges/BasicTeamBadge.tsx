import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FreshmenFixedBadgeProps {
  className?: string
  content: "신입고정" | "자작곡"
  size: "small" | "large"
}

const BasicTeamBadge = ({
  className,
  content
}: FreshmenFixedBadgeProps) => {
    return (
      <Badge
        className={cn(
          className,
          "h-5 bg-blue-100 text-third text-[10px] hover:bg-blue-100 p-2 lg:h-10 lg:text-md lg:rounded-full lg:px-4 lg:py-1"
        )}
      >
        <span className="hidden lg:block me-2 font-extrabold">●</span>
        {content}
      </Badge>
    )
}

export default BasicTeamBadge
