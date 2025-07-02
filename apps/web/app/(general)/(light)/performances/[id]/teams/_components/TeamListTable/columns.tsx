"use client"

import { CellContext, ColumnDef } from "@tanstack/react-table"
import {
  ArrowUpDown,
  EllipsisVertical,
  Image,
  Paperclip,
  Pencil,
  Trash2
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import React from "react"

import DeleteButton from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/DeleteButton"
import FreshmenFixedBadge from "@/components/TeamBadges/FreshmenFixedBadge"
import SelfMadeSongBadge from "@/components/TeamBadges/SelfMadeSongBadge"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import ROUTES from "@/constants/routes"
import YoutubeVideo from "@/lib/youtube"
import { MemberSession, MemberSessionSet } from "@/types/Team"
import { User } from "@/types/User"
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/dropdown-menu"

export type TeamColumn = {
  performanceId: number
  id: number
  songName: string
  songArtist: string
  leader: User
  memberSessions?: MemberSession[]
  posterImage?: string
  songYoutubeVideoUrl?: string
  isFreshmenFixed: boolean
  isSelfMade: boolean
}

const SortButton = ({
  column,
  children
}: {
  column: any
  children: React.ReactNode
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

const ActionsCell = ({ row }: CellContext<TeamColumn, unknown>) => {
  const { data: user } = useSession()

  if (
    user &&
    ((user.id && row.original.leader.id === +user.id) || user.is_admin)
  ) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-center p-0 "
          >
            <span className="sr-only">Open menu</span>
            <EllipsisVertical className="h-5 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-lg border border-slate-100 p-[5px] text-sm drop-shadow-[0_3px_6px_rgb(0,0,0,0.3)]"
        >
          <DropdownMenuItem className="p-0 selection:text-slate-700 hover:cursor-pointer">
            <Link
              href={ROUTES.PERFORMANCE.TEAM.EDIT(
                row.original.performanceId,
                row.original.id
              )}
              className="flex h-full w-full items-center justify-center gap-x-2 px-6 py-2"
            >
              <Pencil />
              편집하기
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 selection:text-slate-700 hover:cursor-pointer">
            <DeleteButton
              className="flex h-full w-full items-center justify-center gap-x-2 px-6 py-2"
              teamId={row.original.id}
            >
              <Trash2 />
              삭제하기
            </DeleteButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  return null
}

export const columns: ColumnDef<TeamColumn>[] = [
  {
    accessorKey: "songName",
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
          {!row.original.posterImage && (
            <span>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-3 w-3 font-normal text-neutral-500" />
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
    accessorKey: "leaderName",
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
      <div className="flex w-full items-center justify-start">필요 세션</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-start gap-1 text-right font-medium">
          {row.original.memberSessions?.map((ms) => {
            return ms.members.map((member, index) => {
              if (member !== null) return null
              return (
                <SessionBadge
                  key={`${ms.session}-${index}`}
                  session={`${ms.session}${index + 1}`}
                />
              )
            })
          })}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center justify-center">모집상태</div>
    ),
    cell: ({ row }) => {
      const memberSessions = row.original.memberSessions
      const memberSessionsSet = new MemberSessionSet(memberSessions ?? [])
      const status = memberSessionsSet.isSatisfied ? "Inactive" : "Active"
      return (
        <div className="flex items-center justify-center">
          <StatusBadge status={status} />
        </div>
      )
    }
  },
  {
    accessorKey: "songYoutubeVideoUrl",
    header: () => (
      <div className="flex items-center justify-center">영상링크</div>
    ),
    cell: ({ row }) => {
      const youtubeLink = YoutubeVideo.getURL(
        row.getValue("songYoutubeVideoUrl")
      )
      if (youtubeLink) {
        return (
          <Link
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center"
          >
            <Paperclip size={24} />
          </Link>
        )
      }
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (props) => <ActionsCell {...props} />
  }
]
