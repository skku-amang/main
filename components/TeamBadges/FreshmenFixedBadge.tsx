import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FreshmenFixedBadgeProps {
  className?: string
  teamspage?: boolean
}
{
  /* 팀 목록이라면 teamspage={false}, 팀 상세페이지라면 teamspage={true}로 설정 */
}
const FreshmenFixedBadge = ({
  className,
  teamspage
}: FreshmenFixedBadgeProps) => {
  if (teamspage === false) {
    return (
      <Badge
        className={cn(
          "h-5 border-[0.5px] border-gray-200 bg-blue-100 text-third hover:bg-blue-100",
          className
        )}
      >
        신입고정
      </Badge>
    )
  } else {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-md rounded-full border-none bg-blue-100 px-[0.83rem] py-1 font-semibold text-third",
          className
        )}
      >
        <span className="me-2 font-extrabold">●</span>
        신입고정
      </Badge>
    )
  }
}

export default FreshmenFixedBadge
