import dayjs from "dayjs"
import { Minus } from "lucide-react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"

import { useToast } from "@/components/hooks/use-toast"
import { useUnapplyFromTeam } from "@/hooks/api/useTeam"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useAuth } from "@/lib/providers/auth-provider"
import type { SessionNameValue } from "@/constants/session"
import { TeamDetail, formatGenerationOrder } from "@repo/shared-types"

type TeamMember = TeamDetail["teamSessions"][number]["members"][number]["user"]

interface MemberSessionCardProps {
  teamId: number
  sessionId: number
  sessionName: SessionNameValue
  sessionIndex: number
  user: TeamMember
  joinedAt: Date | string

  onUnapplySuccess: (team: TeamDetail) => void
  /** 팀 모집 단계에서만 탈퇴 가능 (서버도 409) */
  canUnapply?: boolean
}

// TODO: Table으로 변경
const MemberSessionCard = ({
  teamId,
  sessionId,
  sessionName,
  sessionIndex,
  user,
  joinedAt,
  onUnapplySuccess,
  canUnapply = true
}: MemberSessionCardProps) => {
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const unapplyMutation = useUnapplyFromTeam({
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      toast({
        title: "탈퇴 완료",
        description: "팀에서 탈퇴되었습니다."
      })
      onUnapplySuccess(team)
    },
    onError: (error) => {
      toast({
        title: "탈퇴 실패",
        description: error.detail ?? error.message,
        variant: "destructive"
      })
    }
  })

  function handleUnapply() {
    unapplyMutation.mutate([teamId, [{ sessionId, index: sessionIndex }]])
  }

  return (
    <div className="flex py-4">
      <div className="hidden h-[48px] w-[160px] items-center pl-4 md:flex">
        {getSessionDisplayName(sessionName)}
        {sessionIndex}
      </div>

      {/* 유저 정보 */}
      <div className="relative flex min-h-[48px] w-full items-center md:w-[466px] md:pl-4">
        {/* 아바타 */}
        <Avatar className="mr-[12px] md:mr-[24px]">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
        </Avatar>

        {/* 설명 */}
        <div>
          <div className="mb-[8px] block text-sm font-semibold md:hidden md:text-lg">
            {getSessionDisplayName(sessionName)}
            {sessionIndex}
          </div>
          <Link
            href={ROUTES.MEMBER_PROFILE(user.id)}
            className="block text-sm font-normal leading-3 text-slate-700 hover:underline md:text-xl md:font-medium md:leading-relaxed"
          >
            {user.generation &&
              `${formatGenerationOrder(user.generation.order)}기 `}
            {user.name}
          </Link>
          <div className="hidden text-sm text-gray-400 md:block">
            #{user.nickname}
          </div>
          <time
            dateTime={new Date(joinedAt).toISOString()}
            className="mt-1 block text-xs text-gray-400 md:mt-0"
          >
            {dayjs(joinedAt).format("YY.MM.DD HH:mm")} 참여
          </time>
        </div>

        {/* 탈퇴 버튼 */}
        {canUnapply && user.id === authUser?.id && (
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
