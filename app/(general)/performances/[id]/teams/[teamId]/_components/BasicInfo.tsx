import { PenLine, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { formatGenerationOrder, getRepresentativeRelativeTime } from "@/lib/utils"
import { MemberSessionSet, Team } from "@/types/Team"

interface BasicInfoProps {
  performanceId: number
  team: Team
  accessToken?: string
}

const BasicInfo = ({ performanceId, team, accessToken }: BasicInfoProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const { data: user } = useSession()

  const memberSessionSet = new MemberSessionSet(team.memberSessions ?? [])

  function onDeleteButtonClick() {
    // TODO: 확인 모달 추가
    fetchData(API_ENDPOINTS.TEAM.DELETE(team.id) as ApiEndpoint, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(async (res) => {
      if (!res.ok) {
        switch (res.status) {
          default:
            toast({
              title: "팀 삭제 실패",
              description: "알 수 없는 이유",
              variant: "destructive"
            })
        }
      }
      toast({
        title: "팀 삭제 성공",
        description: "성공적으로 팀을 삭제했습니다."
      })
      router.push(ROUTES.PERFORMANCE.TEAM.LIST(performanceId))
    })
  }

  return (
    <div className="rounded-2xl p-14 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          {/* 곡 정보 */}
          <div className="flex items-center gap-x-3">
            <h3 className="text-4xl font-extrabold">{team.songName}</h3>
            <StatusBadge
              status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
            />
            {team.isFreshmenFixed && <FreshmenFixedBadge size="large" />}
          </div>
          <h4 className="mb-3 text-2xl text-gray-500">
            {team.songArtist} {team.isSelfMade && "(자작곡)"}
          </h4>
        </div>
        
        {/* 팀 편집, 삭제 버튼 */}
        {user && (user.is_admin || (user.id && +user.id === team.leader.id)) && (
          <div className="flex items-center justify-center gap-x-5">
            <Button asChild variant="outline" className="h-12 w-12 p-2 shadow">
              <Link
                href={ROUTES.PERFORMANCE.TEAM.EDIT(team.performance.id, team.id)}
              >
                <PenLine strokeWidth={1.25} />
              </Link>
            </Button>
            <form action={onDeleteButtonClick}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 w-12 p-2 shadow"
              >
                <Trash2 strokeWidth={1.25} />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* 팀장 */}
      <div className="mb-8 flex items-center justify-start gap-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-primary">
            {formatGenerationOrder(team.leader.generation.order)}기&nbsp;
            {team.leader.name}
          </div>
          {getRepresentativeRelativeTime(team.createdDatetime)}
        </div>
      </div>

      {/* 설명 */}
      <p>{team.description}</p>
    </div>
  )
}

export default BasicInfo
