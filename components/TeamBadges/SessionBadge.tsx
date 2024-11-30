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
        "h-6 rounded bg-neutral-200 font-normal text-black hover:bg-neutral-200",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
