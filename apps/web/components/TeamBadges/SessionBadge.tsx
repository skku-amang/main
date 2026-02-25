import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SessionBadgeProps {
  session: string
  className?: string
}

const SessionBadge = ({ session, className }: SessionBadgeProps) => {
  return (
    <Badge
      className={cn(
        "h-6 rounded-[5px] bg-neutral-200 hover:bg-neutral-200 text-xs font-medium text-neutral-600 text-nowrap px-1.5 select-none",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
