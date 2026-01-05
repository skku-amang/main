import { Minus } from "lucide-react"
import { useSession } from "next-auth/react"

import useTeamApplication from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_hooks/useTeamApplication"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSessionDisplayName } from "@/constants/session"
import { SessionName } from "@repo/database"
import { TeamDetail } from "@repo/shared-types"

type TeamMember = TeamDetail["teamSessions"][number]["members"][number]["user"]

interface MemberSessionCardProps {
  teamId: number
  sessionId: number
  sessionName: SessionName
  sessionIndex: number
  user: TeamMember
  // eslint-disable-next-line no-unused-vars
  onUnapplySuccess: (team: TeamDetail) => void
}

// TODO: Table으로 변경
const MemberSessionCard = ({
  teamId,
  sessionId,
  sessionName,
  sessionIndex,
  user
}: MemberSessionCardProps) => {
  const authSession = useSession()

  const { onRemoveSession, onSubmit } = useTeamApplication(teamId)

  function handleUnapply() {
    onRemoveSession(sessionId, sessionIndex)
    onSubmit()
  }

  return (
    <div className="flex py-4">
      <div className="hidden h-[48px] w-[160px] items-center pl-4 md:flex">
        {getSessionDisplayName(sessionName)}
        {sessionIndex}
      </div>

      {/* 유저 정보 */}
      <div className="relative flex h-[48px] w-[466px] items-center md:pl-4 ">
        {/* 아바타 */}
        <Avatar className="mr-[12px] md:mr-[24px]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
        </Avatar>

        {/* 설명 */}
        <div>
          <div className="mb-[8px] block text-sm font-semibold md:hidden md:text-lg">
            {sessionName}
            {sessionIndex}
          </div>
          <div className="text-sm font-normal leading-3 text-slate-700 md:text-xl md:font-medium md:leading-relaxed">
            {user.name}
          </div>
          <div className="hidden text-sm text-gray-400 md:block">
            #{user.nickname}
          </div>
        </div>

        {/* 탈퇴 버튼 */}
        {user.id.toString() === authSession.data?.user.id && (
          <button
            className="absolute right-0 flex h-6 w-6 justify-center rounded-full bg-destructive "
            onClick={handleUnapply}
          >
            <Minus className="text-white" />
          </button>
        )}
      </div>
    </div>
  )
}

export default MemberSessionCard
