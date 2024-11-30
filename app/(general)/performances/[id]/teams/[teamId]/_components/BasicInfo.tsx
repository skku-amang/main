import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import TeamsPagePadding from "@/constants/teamspagepadding"
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
    <div
      className={`w-full rounded-2xl bg-white shadow-md min-[878px]:w-11/12 lg:w-5/6 ${TeamsPagePadding.Padding}`}
    >
      {/* 팀장 */}
      {team.isFreshmenFixed && (
        <FreshmenFixedBadge
          size="large"
          className="w-[5rem] justify-center max-sm:text-xs sm:w-[6.5rem]"
        />
      )}
      <div className="mb-4 flex items-center justify-start gap-x-3 pt-4 sm:gap-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{team.leader?.name.substring(0, 1)}</AvatarFallback>
        </Avatar>

        <div className="text-primary max-sm:text-sm">
          {formatGenerationOrder(team.leader.generation.order)}기&nbsp;
          {team.leader.name}
        </div>
        <div className="text-gray-400 max-sm:text-xs">
          {getRepresentativeRelativeTime(team.createdDatetime)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          {/* 곡 정보 */}
          <div className="flex items-center gap-x-5 md:gap-x-3">
            <h3 className="text-2xl font-extrabold md:text-3xl">
              {team.songName}
            </h3>
            <StatusBadge
              status={memberSessionSet.isSatisfied ? "Inactive" : "Active"}
              className="w-[5rem] justify-center max-sm:text-xs sm:w-[6.5rem]"
            />
          </div>
          <h4 className="my-2 font-['Inter'] text-base font-normal text-gray-500 sm:text-lg md:text-xl ">
            {team.songArtist} {team.isSelfMade && "(자작곡)"}
          </h4>
        </div>
      </div>

      {/* 설명 */}
      <p className="pt-6 font-['Inter'] text-base font-normal leading-normal tracking-wide text-slate-700 sm:pt-8 md:text-lg">
        {team.description}
      </p>
    </div>
  )
}

export default BasicInfo
