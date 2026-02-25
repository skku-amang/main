"use client"

import { Image, PencilLine, Trash2 } from "lucide-react"
import Link from "next/link"

import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import SelfMadeSongBadge from "@/components/TeamBadges/SelfMadeSongBadge"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import TeamDeleteButton from "@/components/TeamDeleteButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useTeamPermission } from "@/hooks/useTeamPermission"
import {
  getMissingIndices,
  TeamFromList,
  TeamSessionFromList
} from "@/lib/team/teamSession"

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
  missingTeamSessions
}: TeamCardProps) => {
  const { canEdit } = useTeamPermission({ leaderId: leader.id })

  return (
    <div className="border-b border-gray-200 bg-white px-1 py-4">
      <Link href={ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, id)}>
        <div>
          {/* 곡명 & 상태 */}
          <div className="text-md flex items-start justify-between">
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
    </div>
  )
}

export default TeamCard
