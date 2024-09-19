import { Badge } from "@/components/ui/badge"
import { SessionName } from "@/types/Session"

const SessionBadge = ({ session }: { session: SessionName }) => {
  return <Badge className="rounded-lg bg-slate-200 text-black">{session}</Badge>
}

export default SessionBadge
