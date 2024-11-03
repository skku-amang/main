import { PenLine, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useToast } from "@/components/hooks/use-toast"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { MemberSessionSet, Team } from "@/types/Team"

interface BasicInfoProps {
  team: Team
  accessToken?: string
}

const BasicInfo = ({ team, accessToken }: BasicInfoProps) => {
  const router = useRouter()
  const { toast } = useToast()

  const memberSessionSet = new MemberSessionSet(team.memberSessions ?? [])

  function onDeleteButtonClick() {
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
      router.push(ROUTES.PERFORMANCE.TEAMS(1).url) // TODO: 실제 기본 공연 ID로 변경
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
          </div>
          <h4 className="mb-3 text-2xl text-gray-500">{team.songArtist}</h4>
        </div>
        <div className="flex items-center justify-center gap-x-5">
          <Button asChild variant="outline" className="h-12 w-12 p-2 shadow">
            <Link href={ROUTES.TEAM.EDIT(team.id).url}>
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
      </div>

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
