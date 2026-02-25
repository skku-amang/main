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
        "rounded bg-slate-200 hover:bg-slate-200 text-[13px] font-normal leading-none text-slate-700 text-nowrap px-2 select-none",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
