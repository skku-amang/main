"use client"

import { CellContext, ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Image, Paperclip, Star } from "lucide-react"
import Link from "next/link"
import React from "react"

import { useMiniPlayer } from "@/components/MiniPlayer"
import { useTeamPermission } from "@/hooks/useTeamPermission"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import SelfMadeSongBadge from "@/components/TeamBadges/SelfMadeSongBadge"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import TeamBookmarkButton from "@/components/TeamBookmarkButton"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { matchesKorean } from "@/lib/hangul-search"
import {
  getMissingIndices,
  isTeamSatisfied,
  TeamFromList
} from "@/lib/team/teamSession"
import { extractYoutubeVideoId } from "@repo/shared-types"

import TeamActionsMenu from "../TeamActionsMenu"

export type TeamColumn = TeamFromList & { isBookmarked: boolean }

const SortButton = ({
  column,
  children
}: {
  column: any
  children: React.ReactNode
}) => {
  return (
    <div
      className="flex cursor-pointer items-center"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </div>
  )
}

const ActionsCell = ({ row }: CellContext<TeamColumn, unknown>) => {
  const { canEdit } = useTeamPermission({
    leaderId: row.original.leader.id
  })

  if (!canEdit) return null
  return (
    <TeamActionsMenu
      performanceId={row.original.performanceId}
      teamId={row.original.id}
      className="w-full"
    />
  )
}

const YoutubeCell = ({ row }: { row: any }) => {
  const { play } = useMiniPlayer()
  const rawUrl = row.original.songYoutubeVideoUrl
  if (!rawUrl) return null

  const videoId = extractYoutubeVideoId(rawUrl) ?? rawUrl

  return (
    <button
      onClick={() =>
        play(videoId, `${row.original.songName} - ${row.original.songArtist}`)
      }
      className="flex w-full items-center justify-center"
    >
      <Paperclip size={24} />
    </button>
  )
}

export const columns: ColumnDef<TeamColumn>[] = [
  {
    // 정렬 '별표 우선'(bookmark-desc)의 기준이기도 함
    id: "bookmark",
    accessorFn: (row) => (row.isBookmarked ? 1 : 0),
    header: ({ column }) => (
      <SortButton column={column}>
        <Star className="size-4" aria-label="별표" />
      </SortButton>
    ),
    cell: ({ row }) => (
      <TeamBookmarkButton
        teamId={row.original.id}
        bookmarked={row.original.isBookmarked}
      />
    )
  },
  {
    accessorKey: "songName",
    // 곡명과 팀장·팀원 이름 중 하나라도 맞으면 검색 결과에 포함
    filterFn: (row, _columnId, filterValue) => {
      const team = row.original
      const memberNames = team.teamSessions.flatMap((ts) =>
        ts.members.map((m) => m.user.name)
      )
      return [team.songName, team.leader.name, ...memberNames].some((text) =>
        matchesKorean(text ?? "", String(filterValue))
      )
    },
    header: ({ column }) => <SortButton column={column}>곡명</SortButton>,
    cell: ({ row }) => (
      <Link
        href={ROUTES.PERFORMANCE.TEAM.DETAIL(
          row.original.performanceId,
          row.original.id
        )}
      >
        {/* 곡명 */}
        <div className="flex items-center gap-x-1">
          {row.original.songName}
          {row.original.image && (
            <span>
              <Image size={15} className="text-neutral-800" strokeWidth={1.5} />
            </span>
          )}
        </div>

        {/* 아티스트명 */}
        <div className="flex items-center justify-start gap-x-1">
          <span className="text-neutral-400">{row.original.songArtist}</span>
          {row.original.isSelfMade && <SelfMadeSongBadge />}
        </div>
      </Link>
    )
  },
  {
    id: "leaderName",
    accessorFn: (row) => row.leader.name,
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <SortButton column={column}>팀장</SortButton>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.leader.name}
        <br />
        {row.original.isFreshmenFixed && <FreshmenFixedBadge size="small" />}
      </div>
    )
  },
  {
    id: "requiredSessions",
    header: () => (
      <div className="flex w-full items-center justify-start">필요세션</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-start gap-2.5 text-right font-medium">
          {row.original.teamSessions.map((ts) => {
            const missingIndices = getMissingIndices(ts)
            return missingIndices.map((index) => (
              <SessionBadge
                key={`${ts.session.name}-${index}`}
                session={`${getSessionDisplayName(ts.session.name)}${index}`}
              />
            ))
          })}
        </div>
      )
    }
  },
  {
    id: "status",
    accessorFn: (row) => (isTeamSatisfied(row.teamSessions) ? 1 : 0),
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <SortButton column={column}>모집상태</SortButton>
      </div>
    ),
    cell: ({ row }) => {
      const teamSessions = row.original.teamSessions
      const status = isTeamSatisfied(teamSessions) ? "Inactive" : "Active"
      return (
        <div className="flex items-center justify-center">
          <StatusBadge status={status} size="middle" />
        </div>
      )
    }
  },
  {
    accessorKey: "songYoutubeVideoUrl",
    header: () => (
      <div className="flex items-center justify-center">영상링크</div>
    ),
    cell: ({ row }) => <YoutubeCell row={row} />
  },
  {
    accessorKey: "createdAt",
    header: () => null,
    cell: () => null,
    enableHiding: true
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (props) => <ActionsCell {...props} />
  }
]
