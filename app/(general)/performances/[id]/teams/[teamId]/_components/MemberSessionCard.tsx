import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

    const data = await res.json()
    toast({
      title: "탈퇴 완료",
      description: "성공적으로 팀에서 탈퇴되었습니다!"
    })
    onUnapplySuccess(data)
  }

  return (
    <div>
      {/* 세션 라벨 */}
      <div className="flex select-none items-center justify-center">
        <div className="rounded-t-md bg-slate-200 px-2 py-1 text-sm font-semibold">
          {session}
          {sessionIndex}
        </div>
        <div className="flex-auto" />
      </div>

      {/* 유저 정보 */}
      <div className="flex items-center justify-start gap-x-8 rounded-lg rounded-tl-none border border-slate-200 px-8 py-2">
        {/* 아바타 */}
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
        </Avatar>

        {/* 설명 */}
        <div>
          <div>
            {formatGenerationOrder(user.generation?.order)}기 {user.name}
          </div>
          <div className="text-sm text-gray-400">#{user.nickname}</div>

          {/* 탈퇴 버튼 */}
          {user.id.toString() === authSession.data?.id && (
            <Button
              variant="destructive"
              onClick={onUnapply}
              className="h-6 px-2"
            >
              탈퇴
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemberSessionCard
