import { Minus } from "lucide-react"
import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { formatGenerationOrder } from "@/lib/utils"
import { SessionName } from "@/types/Session"
import { Team } from "@/types/Team"
import { User } from "@/types/User"

interface MemberSessionCardProps {
  teamId: number
  session: SessionName
  sessionIndex: number
  user: User
  // eslint-disable-next-line no-unused-vars
  onUnapplySuccess: (team: Team) => void
}

const MemberSessionCard = ({
  teamId,
  session,
  sessionIndex,
  user,
  onUnapplySuccess
}: MemberSessionCardProps) => {
  const authSession = useSession()
  const { toast } = useToast()

  if (!authSession) {
    return <div>로그인 필요</div>
  }

  async function onUnapply() {
    const res = await fetchData(
      API_ENDPOINTS.TEAM.UNAPPLY(teamId) as ApiEndpoint,
      {
        body: JSON.stringify({ session, index: sessionIndex }),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${authSession.data?.access}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!res.ok) {
      toast({
        title: "탈퇴 실패",
        description: (await res.json())?.detail || "알 수 없는 에러 발생",
        variant: "destructive"
      })
      return
    }

    const data = (await res.json()) as Team
    toast({
      title: "탈퇴 완료",
      description: "성공적으로 팀에서 탈퇴되었습니다!"
    })
    onUnapplySuccess(data)
  }

  return (
    <div className="flex py-4">
      <div className="flex h-[48px] w-[160px] items-center pl-4">
        {session}
        {sessionIndex}
      </div>

      {/* 유저 정보 */}
      <div className="relative flex h-[48px] w-[466px] items-center pl-4">
        {/* 아바타 */}
        <Avatar className="mr-[24px]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
        </Avatar>

        {/* 설명 */}
        <div>
          <div>
            {formatGenerationOrder(user.generation?.order)}기 {user.name}
          </div>
          <div className="text-sm text-gray-400">#{user.nickname}</div>
        </div>
        {/* 탈퇴 버튼 */}
        {user.id.toString() === authSession.data?.id && (
          <div
            className="absolute right-0 flex h-6 w-6 justify-center rounded-full  bg-red-500 "
            onClick={() => onUnapply()}
          >
            <Minus className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberSessionCard
