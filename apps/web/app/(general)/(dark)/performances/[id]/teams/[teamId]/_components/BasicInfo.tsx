import DeleteEditButton from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/DeleteEditButton"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isTeamSatisfied } from "@/lib/team/teamSession"
import {
  formatGenerationOrder,
  getRepresentativeRelativeTime
} from "@/lib/utils"
import { TeamDetail } from "@repo/shared-types"

interface BasicInfoProps {
  team: TeamDetail
  canEdit?: boolean
}

const BasicInfo = ({ team, canEdit = false }: BasicInfoProps) => {
  const isSatisfied = isTeamSatisfied(team.teamSessions ?? [])

  return (
    <div className="relative h-fit w-full rounded-2xl bg-white px-[26px] py-[30px] text-lg font-semibold shadow-[0_4px_30px_0_rgba(59,130,246,0.07)] md:w-[466px] md:px-[40px] md:py-[60px]">
      {/* 신입고정 뱃지 */}
      {team.isFreshmenFixed && (
        <FreshmenFixedBadge
          size="large"
          className="mb-[10px] h-[20px] w-[72px] justify-center bg-slate-100 px-0 text-xs font-semibold  text-primary md:mb-[16px] md:h-[32px] md:w-[130px] md:text-lg"
        />
      )}

      {/* 팀장 + 수정/삭제 */}
      <div className="mb-3 flex items-center justify-start gap-x-[8px] md:mb-[24px] md:gap-x-[10px]">
        <Avatar className="h-[24px] w-[24px] md:h-[48px] md:w-[48px]">
          <AvatarImage src={team.leader?.image ?? undefined} />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="text-xs font-medium leading-3 text-primary md:text-base">
          {team.leader.generation &&
            `${formatGenerationOrder(team.leader.generation.order)}기 `}
          {team.leader.name}
        </div>
        <div className="text-xs font-light leading-3 text-gray-400 md:text-base md:font-normal">
          {getRepresentativeRelativeTime(team.createdAt)}
        </div>
        {canEdit && (
          <DeleteEditButton
            className="ml-auto hidden md:flex"
            performanceId={team.performanceId}
            team={team}
          />
        )}
      </div>

      {/* 곡 정보 */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-x-[12px] md:gap-x-3">
          <h3 className="text-xl font-semibold leading-none text-slate-800 md:text-4xl">
            {team.songName}
          </h3>
          <StatusBadge
            status={isSatisfied ? "Inactive" : "Active"}
            size="large"
            className="shrink-0"
          />
        </div>
        <h4 className="h-[34px] text-sm font-normal text-gray-500 md:text-2xl">
          {team.songArtist} {team.isSelfMade && "(자작곡)"}
        </h4>
      </div>

      {/* 설명 */}
      {team.description && (
        <p className="pt-[14px] text-base font-normal leading-snug tracking-wide text-slate-700 md:pt-[28px] md:leading-normal">
          {team.description}
        </p>
      )}
    </div>
  )
}

export default BasicInfo
