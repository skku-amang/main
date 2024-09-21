import StatusBadge from "@/components/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MemberSessionSet, Team } from "@/types/Team"

interface BasicInfoProps {
  team: Team
}

const BasicInfo = ({ team }: BasicInfoProps) => {
  const memberSessionSet = new MemberSessionSet(team.memberSessions ?? [])

  return (
    <div className="rounded-2xl p-14 shadow-md">
      {/* 곡 정보 */}
      <div className="flex items-center gap-x-3">
        <h3 className="text-4xl font-extrabold">{team.songName}</h3>
        <StatusBadge
          status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
        />
      </div>
      <h4 className="mb-3 text-2xl text-gray-500">{team.songArtist}</h4>

      {/* 팀장 */}
      <div className="mb-8 flex items-center justify-start gap-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-primary">
            {team.leader?.generation?.order}기 {team.leader?.name}
            <span># {team.leader?.nickname}</span>
          </div>
          <div className="text-xs text-gray-300">{team.createdDatetime}</div>
        </div>
      </div>

      {/* 설명 */}
      <p>{team.description}</p>
    </div>
  )
}

export default BasicInfo
