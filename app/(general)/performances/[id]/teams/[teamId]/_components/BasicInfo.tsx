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
    <div className="h-fit w-full rounded-2xl bg-white px-[40px] py-[60px] text-lg font-semibold shadow-md md:w-[466px]">
      {/* 팀장 */}
      {team.isFreshmenFixed && (
        <FreshmenFixedBadge
          size="large"
          className="mb-[16px] h-[32px] w-[130px] justify-center bg-slate-100 text-primary"
        />
      )}
      <div className="mb-[24px] flex items-center justify-start gap-x-[10px]">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>

        <div className=" text-base font-medium leading-3 text-primary">
          {formatGenerationOrder(team.leader.generation.order)}기&nbsp;
          {team.leader.name}
        </div>
        <div className=" text-base font-normal leading-3 text-gray-400">
          {getRepresentativeRelativeTime(team.createdDatetime)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          {/* 곡 정보 */}
          <div className="flex items-end gap-x-[20px] md:gap-x-3">
            <h3 className="h-fit items-baseline text-2xl font-extrabold md:text-3xl">
              {team.songName}
            </h3>
            <StatusBadge
              status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
              className="mb-1 h-[32px] w-[130px] justify-center max-sm:text-xs"
            />
          </div>
          <h4 className="my-2 h-[34px] text-2xl font-normal text-gray-500 ">
            {team.songArtist} {team.isSelfMade && "(자작곡)"}
          </h4>
        </div>
      </div>

      {/* 설명 */}
      <p className="pt-[28px] text-base font-normal leading-normal tracking-wide text-slate-700 ">
        {team.description}
      </p>
    </div>
  )
}

export default BasicInfo
