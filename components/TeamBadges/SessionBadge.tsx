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
        "h-6 rounded bg-neutral-200 font-normal text-slate-700 hover:bg-neutral-300",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
