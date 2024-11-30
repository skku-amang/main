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
        "h-6 rounded bg-slate-200 font-normal text-slate-700 hover:bg-neutral-200",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
