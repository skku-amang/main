import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SessionBadgeProps {
  session: string
  className?: string
}

const SessionBadge = ({ session, className }: SessionBadgeProps) => {
  return (
    <Badge className={cn("h-6 select-none rounded bg-slate-200 font-normal text-black hover:bg-slate-200", className)}>
      {session}
    </Badge>
  )
}

export default SessionBadge
