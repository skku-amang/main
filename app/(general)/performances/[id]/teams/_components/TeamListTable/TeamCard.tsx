import Link from "next/link"

import SessionBadge from "@/components/SessionBadge"
import StatusBadge from "@/components/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ROUTES from "@/constants/routes"
import { MemberSession } from "@/types/Team"

interface TeamCardProps {
  id: number
  songName: string
  songArtist: string
  image?: string
  leaderName?: string
  memberSessions: MemberSession[]
}

const TeamCard = ({
  id,
  songName,
  songArtist,
  image,
  leaderName,
  memberSessions
}: TeamCardProps) => {
  return (
    <Link href={ROUTES.TEAM.DETAIL(id).url}>
      <div className="rounded bg-white p-5 shadow-md">
        {/* 곡명 & 상태 */}
        <div className="flex items-start justify-between">
          <h4 className="font-bold">{songName}</h4>
          <StatusBadge
            status={memberSessions.length > 0 ? "Active" : "Inactive"}
            className="text-xs"
          />
        </div>

        {/* 아티스트명 & 태그 */}
        <div className="mt-1 flex items-center justify-between">
          <h4 className="text-sm font-semibold">{songArtist}</h4>
        </div>

        {/* 팀장 */}
        <div className="mt-2 flex items-center justify-between">
          <h4 className="text-xs">팀장</h4>
          <div>
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{leaderName?.substring(0, 1)}</AvatarFallback>
            </Avatar>
            {leaderName}
          </div>
        </div>

        {/* 필요세션 */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <h4 className="text-xs">필요세션</h4>
          <div className="flex gap-1">
            {memberSessions?.map((ms, index) => (
              <SessionBadge
                key={`${ms.session}-${index}`}
                session={`${ms.session}${index + 1}`}
                className="rounded-lg p-1"
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default TeamCard
