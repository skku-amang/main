import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SessionName } from "../../../../types/Session"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { FaFilter } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MdOpenInNew } from "react-icons/md";


interface TeamListRowType {
  songName: string
  songArtist: string
  leaderName: string
  requiredSessions: SessionName[]
  cover_url: string
}

type TeamStatus = "모집 완료" | "모집 중"
const TeamListRow = ({ songName, songArtist, leaderName, requiredSessions, cover_url }: TeamListRowType) => {
  const status: TeamStatus = requiredSessions.length === 0 ? "모집 완료" : "모집 중"
  return (
    <TableRow className="p-0">
      <TableCell>
        <p>{songName}</p>
        <span className="text-slate-400 truncate">{songArtist}</span>
      </TableCell>
      <TableCell>{leaderName}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          {requiredSessions.map((session) => (
            <SessionBadge sessionName={session} />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>
      <TableCell>
        <Link href={cover_url}><MdOpenInNew size={24} /></Link>
      </TableCell>
    </TableRow>
  )
}

const SessionBadge = ({ sessionName }: { sessionName: SessionName }) => {
  return (
    <Badge className="rounded-lg">{sessionName}</Badge>
  )
}


const StatusBadge = ({ status }: { status: TeamStatus }) => {
  const className = status === "모집 완료" ?
  "bg-red-100 border-destructive text-destructive font-bold"
  :
  "bg-green-100 border-green-600 text-green-600 font-bold"
  return (
    <Badge
      variant="outline"
      className={cn(className, "border rounded-lg")}>
      {status}
    </Badge>
  )
}

const TeamList = () => {
  return (
    <>
      TeamList
    </>
  )
}

export default TeamList