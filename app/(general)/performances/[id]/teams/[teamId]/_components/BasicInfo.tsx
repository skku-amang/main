import { PenLine, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import DeleteEditButton from "@/app/(general)/performances/[id]/teams/[teamId]/_components/DeleteEditButton"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  formatGenerationOrder,
  getRepresentativeRelativeTime
} from "@/lib/utils"
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
    <div className="relative h-fit w-full rounded-2xl bg-white px-[40px] py-[40px] text-lg font-semibold shadow-md md:w-[466px] md:px-[40px] md:py-[60px]">
      {/* 수정 및 삭제 버튼(데스크탑) */}
      <DeleteEditButton
        className="absolute right-[40px] top-[60px] hidden w-[92px]  md:flex"
        performanceId={team.id}
        team={team}
      />
      {/* 팀장 */}
      {team.isFreshmenFixed && (
        <FreshmenFixedBadge
          size="large"
          className="mb-[10px] h-[20px] w-[72px] justify-center bg-slate-100 px-0 text-xs font-semibold  text-primary md:mb-[16px] md:h-[32px] md:w-[130px] md:text-lg"
        />
      )}
      <div className="mb-[8px] flex items-center justify-start gap-x-[8px] md:mb-[24px] md:gap-x-[10px]">
        <Avatar className="h-[24px] w-[24px] md:h-[48px] md:w-[48px]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="text-xs font-medium leading-3 text-primary md:text-base">
          {formatGenerationOrder(team.leader.generation.order)}기&nbsp;
          {team.leader.name}
        </div>
        <div className=" text-xs font-light leading-3 text-gray-400 md:text-base md:font-normal">
          {getRepresentativeRelativeTime(team.createdDatetime)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {/* 곡 정보 */}
          <div className="flex items-end gap-x-[12px] md:gap-x-3">
            <h3 className="h-fit items-baseline text-2xl font-extrabold md:text-3xl">
              {team.songName}
            </h3>
            <StatusBadge
              status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
              className="mb-1 h-[20px] w-[72px] justify-center max-sm:text-xs md:h-[32px] md:w-[130px]"
            />
          </div>
          <h4 className="h-[34px] text-sm font-normal text-gray-500 md:my-2 md:text-2xl ">
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
      <p className="pt-[14px] text-base font-normal leading-snug tracking-wide text-slate-700 md:pt-[28px] md:leading-normal ">
        {team.description}
      </p>
    </div>
  )
}

export default BasicInfo
