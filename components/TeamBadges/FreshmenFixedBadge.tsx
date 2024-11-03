import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FreshmenFixedBadgeProps {
  className?: string
}

const FreshmenFixedBadge = ({ className }: FreshmenFixedBadgeProps) => {
  return (
    <Badge className={cn("bg-blue-100 hover:bg-blue-100 text-third h-5 border-[0.5px] border-gray-200", className)}>
      신입고정
    </Badge>
  )
}

export default FreshmenFixedBadge