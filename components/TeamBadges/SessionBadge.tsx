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
        "h-5 rounded bg-slate-200 hover:bg-slate-200 text-xs font-normal text-neutral-600 text-nowrap px-2 select-none",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
