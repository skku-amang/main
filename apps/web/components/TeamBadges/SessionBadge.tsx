import { cn } from "@/lib/utils"
import { Badge } from "@repo/ui/badge"

interface SessionBadgeProps {
  session: string
  className?: string
}

const SessionBadge = ({ session, className }: SessionBadgeProps) => {
  return (
    <Badge
      className={cn(
        "h-5 select-none text-nowrap rounded bg-slate-200 px-2 text-xs font-normal text-neutral-600 hover:bg-slate-200",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
