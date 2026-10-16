"use client"

import { Image } from "lucide-react"
import Link from "next/link"

import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import SelfMadeSongBadge from "@/components/TeamBadges/SelfMadeSongBadge"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import TeamBookmarkButton from "@/components/TeamBookmarkButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useTeamPermission } from "@/hooks/useTeamPermission"
import { useAuth } from "@/lib/providers/auth-provider"
import {
  getMissingIndices,
  TeamFromList,
  TeamSessionFromList
} from "@/lib/team/teamSession"
import { cn } from "@/lib/utils"

import TeamActionsMenu from "../../TeamActionsMenu"

interface TeamCardProps {
  performanceId: number
  id: number
  songName: string
  songArtist: string
  isFreshmenFixed: boolean
  isSelfMade: boolean
  image?: string | null
  leader: TeamFromList["leader"]
  missingTeamSessions: TeamSessionFromList[]
  isBookmarked: boolean
}

const TeamCard = ({
  performanceId,
  id,
  songName,
  songArtist,
  isFreshmenFixed = false,
  isSelfMade = false,
  image,
  leader,
  missingTeamSessions,
  isBookmarked
}: TeamCardProps) => {
  const { user, isAuthenticated } = useAuth()
  const { canEdit } = useTeamPermission({ leaderId: leader.id })
  const isMyTeam = user?.id === leader.id

  return (
    <div
      className={cn(
        "relative rounded-lg bg-white p-5 shadow-md",
        isMyTeam && "border-l-4 border-primary pl-4"
      )}
    >
      {isMyTeam && <span className="sr-only">내가 팀장인 팀</span>}
      <Link href={ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, id)}>
        <div>
          {/* 곡명 & 상태 */}
          <div
            className={cn(
              "text-md flex items-start justify-between",
              // 오른쪽 위 별표(로그인 시)·⋯ 메뉴(편집 권한 시) 자리
              isAuthenticated && "pr-8",
              isAuthenticated && canEdit && "pr-16"
            )}
          >
            <div className="flex items-center gap-x-2">
              <h4 className="flex items-center gap-x-1 self-stretch font-bold text-slate-700">
                {songName}
                {image && (
                  <span>
                    <Image className="h-3 w-3 font-normal text-neutral-500" />
                  </span>
                )}
              </h4>
            </div>

            <StatusBadge
              status={missingTeamSessions.length > 0 ? "Active" : "Inactive"}
              className="text-xs"
            />
          </div>

          {/* 아티스트명 & 태그 */}
          <div className="mt-1 flex items-center justify-between text-xs">
            <h4 className="text-sm text-slate-500">{songArtist}</h4>

            <div className="flex items-center gap-x-1">
              {isFreshmenFixed && <FreshmenFixedBadge size={"small"} />}
              {isSelfMade && <SelfMadeSongBadge />}
            </div>
          </div>

          {/* 팀장 */}
          <div className="mt-3 flex w-full items-center justify-between">
            <h4 className="text-xs text-slate-500">팀장</h4>
            <div className="flex items-center gap-x-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src={leader.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {leader.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-500">{leader.name}</span>
            </div>
          </div>

          {/* 모집세션 */}
          <div className="mt-4 flex items-start justify-between text-xs">
            <h4 className="text-xs text-neutral-500">모집세션</h4>
            <div className="flex flex-wrap justify-end gap-1.5">
              {missingTeamSessions?.map((ts) => {
                const missingIndices = getMissingIndices(ts)
                return missingIndices.map((index) => (
                  <SessionBadge
                    key={`${ts.session.name}-${index}`}
                    session={`${getSessionDisplayName(ts.session.name)}${index}`}
                    className="rounded-[5px]"
                  />
                ))
              })}
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute right-1 top-3 flex items-center">
        <TeamBookmarkButton teamId={id} bookmarked={isBookmarked} />
        {/* 액션: 편집, 삭제 */}
        {canEdit && (
          <TeamActionsMenu
            performanceId={performanceId}
            teamId={id}
            className="h-8 w-8"
          />
        )}
      </div>
    </div>
  )
}

export default TeamCard
