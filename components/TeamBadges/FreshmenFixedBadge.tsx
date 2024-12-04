import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FreshmenFixedBadgeProps {
  className?: string
  size: "small" | "large"
}

const FreshmenFixedBadge = ({
  className,
  size = "large"
}: FreshmenFixedBadgeProps) => {
  // 팀 목록
  if (size === "small") {
    return (
      <Badge
        className={cn(
          "h-4 text-[0.7rem] font-bold lg:h-5 p-2 bg-blue-100 text-third hover:bg-blue-100",
          className
        )}
      >
        신입고정
      </Badge>
    )
  }

  // 팀 상세페이지
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-md rounded-full border-none bg-blue-100 px-4 py-1 font-bold text-third",
        className
      )}
    >
      <span className="me-2 font-extrabold">●</span>
      신입고정
    </Badge>
  )
}

export default FreshmenFixedBadge
