import { Badge } from "@/components/ui/badge"
import { SessionName } from "@/types/Session"

const SessionBadge = ({ session }: { session: SessionName }) => {
  return (
    <Badge className="h-6 select-none rounded bg-slate-200 font-normal text-black hover:bg-slate-200">
      {session}
    </Badge>
  )
}

export default SessionBadge
