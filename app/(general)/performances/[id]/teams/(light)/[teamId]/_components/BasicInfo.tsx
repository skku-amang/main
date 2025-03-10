import DeleteEditButton from "@/app/(general)/performances/[id]/teams/(light)/[teamId]/_components/DeleteEditButton"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  formatGenerationOrder,
  getRepresentativeRelativeTime
} from "@/lib/utils"
import { MemberSessionSet, Team } from "@/types/Team"

interface BasicInfoProps {
  team: Team
}

const BasicInfo = ({ team }: BasicInfoProps) => {
  const memberSessionSet = new MemberSessionSet(team.memberSessions ?? [])

  return (
    <div className="relative h-fit w-full rounded-2xl bg-white px-[40px] py-[40px] text-lg font-semibold shadow-md md:w-[466px] md:px-[40px] md:py-[60px]">
      {/* 수정 및 삭제 버튼(데스크탑) */}
      <DeleteEditButton
        className="absolute right-[40px] top-[60px] hidden w-[92px]  md:flex"
        performanceId={team.id}
        team={team}
      />

      {/* 신입고정 뱃지 */}
      {team.isFreshmenFixed && (
        <FreshmenFixedBadge
          size="large"
          className="mb-[10px] h-[20px] w-[72px] justify-center bg-slate-100 px-0 text-xs font-semibold  text-primary md:mb-[16px] md:h-[32px] md:w-[130px] md:text-lg"
        />
      )}

      {/* 팀장 */}
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

      {/* 곡 정보 */}
      <div className="flex items-center gap-x-[12px] md:gap-x-3">
        <h3 className="h-fit items-baseline text-2xl font-extrabold md:text-3xl">
          {team.songName}
        </h3>
        <StatusBadge
          status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
          className="mb-1 h-5 w-20 justify-center max-sm:text-xs md:h-[32px] md:w-[130px]"
        />
      </div>
      <h4 className="h-[34px] text-sm font-normal text-gray-500 md:my-2 md:text-2xl ">
        {team.songArtist} {team.isSelfMade && "(자작곡)"}
      </h4>

      {/* 설명 */}
      <p className="pt-[14px] text-base font-normal leading-snug tracking-wide text-slate-700 md:pt-[28px] md:leading-normal ">
        {team.description}
      </p>
    </div>
  )
}

export default BasicInfo
