import { Minus } from "lucide-react"
import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { formatGenerationOrder } from "@/lib/utils"
import { SessionName, Team, User } from "shared-types"

interface MemberSessionCardProps {
  teamId: number
  session: SessionName
  sessionIndex: number
  user: User
  // eslint-disable-next-line no-unused-vars
  onUnapplySuccess: (team: Team) => void
}

// TODO: Table으로 변경
const MemberSessionCard = ({
  teamId,
  session,
  sessionIndex,
  user,
  onUnapplySuccess
}: MemberSessionCardProps) => {
  const authSession = useSession()
  const { toast } = useToast()

  async function onUnapply() {
    const res = await fetchData(
      API_ENDPOINTS.TEAM.UNAPPLY(teamId) as ApiEndpoint,
      {
        body: JSON.stringify({ session, index: sessionIndex - 1 }),
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
      <div className="hidden h-[48px] w-[160px] items-center pl-4 md:flex">
        {session}
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
            {session}
            {sessionIndex}
          </div>
          <div className="text-sm font-normal leading-3 text-slate-700 md:text-xl md:font-medium md:leading-relaxed">
            {formatGenerationOrder(user.generation?.order)}기 {user.name}
          </div>
          <div className="hidden text-sm text-gray-400 md:block">
            #{user.nickname}
          </div>
        </div>

        {/* 탈퇴 버튼 */}
        {user.id.toString() === authSession.data?.id && (
          <button
            className="absolute right-0 flex h-6 w-6 justify-center rounded-full bg-destructive "
            onClick={onUnapply}
          >
            <Minus className="text-white" />
          </button>
        )}
      </div>
    </div>
  )
}

export default MemberSessionCard
