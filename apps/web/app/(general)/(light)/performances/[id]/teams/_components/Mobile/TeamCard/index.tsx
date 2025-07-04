"use client"

import { Image, PencilLine, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"

import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import SelfMadeSongBadge from "@/components/TeamBadges/SelfMadeSongBadge"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import TeamDeleteButton from "@/components/TeamDeleteButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { MemberSession, User } from "shared-types"

interface TeamCardProps {
  performanceId: number
  id: number
  songName: string
  songArtist: string
  isFreshmenFixed: boolean
  isSelfMade: boolean
  image?: string
  leader: User
  memberSessions: MemberSession[]
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
  memberSessions
}: TeamCardProps) => {
  const session = useSession()
  const user = session?.data

  return (
    <div className="rounded-lg bg-white p-5 shadow-md">
      <Link href={ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, id)}>
        <div>
          {/* 곡명 & 상태 */}
          <div className="text-md flex items-start justify-between">
            {/* 곡명 */}
            <div className="flex items-center gap-x-2">
              <h4 className="flex items-center gap-x-1 self-stretch font-bold text-slate-700">
                {songName}
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                {image && (
                  <span>
                    <Image className="h-3 w-3 font-normal text-neutral-500" />
                  </span>
                )}
              </h4>
            </div>

            {/* 상태 */}
            <StatusBadge
              status={memberSessions.length > 0 ? "Active" : "Inactive"}
              className="text-xs"
            />
          </div>

          {/* 아티스트명 & 태그 */}
          <div className="mt-1 flex items-center justify-between text-xs">
            {/* 아티스트명 */}
            <h4 className="text-sm text-slate-500">{songArtist}</h4>

            {/* 태그(신입고정, 자작곡) */}
            <div className="flex items-center gap-x-1">
              {/* 신입고정 */}
              {isFreshmenFixed && <FreshmenFixedBadge size={"small"} />}

              {/* 자작곡 */}
              {isSelfMade && <SelfMadeSongBadge />}
            </div>
          </div>

          {/* 팀장 */}
          <div className="mt-3 flex items-center justify-between text-slate-500">
            <h4 className="w-20 text-xs">팀장</h4>
            <div className="flex items-center gap-x-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src={leader.profileImage} />
                <AvatarFallback className="text-xs">
                  {leader.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{leader.name}</span>
            </div>
          </div>

          {/* 필요세션 */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <h4 className="w-20 text-xs text-neutral-500">필요세션</h4>
            <div className="gap-x-1 text-right">
              {memberSessions?.map((ms, index) => (
                <SessionBadge
                  key={`${ms.session}-${index}`}
                  session={`${ms.session}${index + 1}`}
                  className="m-0.5 rounded-lg p-1"
                />
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* 액션: 편집, 삭제 */}
      {user && (user.is_admin || (user.id && +user?.id === leader.id)) && (
        <div className="mt-3 grid grid-cols-2 gap-x-4">
          <Button
            asChild
            className="flex h-9 w-full items-center gap-x-2 rounded-lg border-none bg-slate-100 text-xs text-primary drop-shadow-sm"
            variant="outline"
          >
            <Link href={ROUTES.PERFORMANCE.TEAM.EDIT(performanceId, id)}>
              <PencilLine size={14} strokeWidth={2} className="font-bold" />
              편집하기
            </Link>
          </Button>
          <TeamDeleteButton teamId={id} className="w-full">
            <Button
              asChild
              className="flex h-9 w-full items-center gap-x-2 rounded-lg bg-slate-100 text-xs text-primary drop-shadow-sm"
              variant="destructive"
            >
              <div>
                <Trash2 size={14} strokeWidth={2} className="font-bold" />
                삭제하기
              </div>
            </Button>
          </TeamDeleteButton>
        </div>
      )}
    </div>
  )
}

export default TeamCard
