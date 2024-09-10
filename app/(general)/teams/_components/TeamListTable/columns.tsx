"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import React from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { GoPencil } from "react-icons/go"
import { GoTrash } from "react-icons/go"
import { MdOpenInNew } from "react-icons/md"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"
import { Session } from "@/types/Session"
import { MemberSession, MemberSessionSet } from "@/types/Team"

type TeamStatus = "모집 완료" | "모집 중"
export type TeamColumn = {
  id: number
  songName: string
  songArtist: string
  leaderName: string
  memberSessions: MemberSession[]
  coverUrl?: string
  isFreshmanFixed: boolean
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

const SessionBadge = ({ session }: { session: Session }) => {
  return (
    <Badge className="rounded-lg bg-slate-200 text-black">{session.name}</Badge>
  )
}

const StatusBadge = ({ status }: { status: TeamStatus }) => {
  const className =
    status === "모집 완료"
      ? "bg-red-100 border-destructive text-destructive "
      : "bg-green-100 border-green-600 text-green-600 "
  return (
    <div className="flex justify-center">
      <Badge
        variant="outline"
        className={cn(className, "rounded-lg border font-bold")}
      >
        {status}
      </Badge>
    </div>
  )
}

export const columns: ColumnDef<TeamColumn>[] = [
  {
    accessorKey: "songName",
    header: ({ column }) => <SortButton column={column}>곡명</SortButton>,
    cell: ({ row }) => (
      <Link href={ROUTES.TEAM.DETAIL.url(row.original.id.toString())}>
        {row.getValue("songName")}
        <br />
        <span className="text-slate-300">{row.original.songArtist}</span>
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
        {row.getValue("leaderName")}
        <br />
        {row.original.isFreshmanFixed && (
          <Badge className="bg-blue-900 py-0">신입고정</Badge>
        )}
      </div>
    )
  },
  {
    id: "requiredSessions",
    header: "필요 세션",
    cell: ({ row }) => {
      const memberSessions = row.original.memberSessions
      const memberSessionsSet = new MemberSessionSet(memberSessions)
      const requiredMembers =
        memberSessionsSet.getRequiredSessionsWithMissingUserCount()

      return (
        <div className="flex justify-start gap-1 text-right font-medium">
          {Array.from(requiredMembers.entries()).map(
            ([session, requiredMemberCount]) => {
              if (requiredMemberCount === 0) return
              return <SessionBadge key={session.id} session={session} />
            }
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <SortButton column={column}>모집상태</SortButton>
      </div>
    ),
    cell: ({ row }) => {
      const memberSessions = row.original.memberSessions
      const memberSessionsSet = new MemberSessionSet(memberSessions)
      const status: TeamStatus = memberSessionsSet.isSatisfied
        ? "모집 완료"
        : "모집 중"
      return <StatusBadge status={status} />
    }
  },
  {
    accessorKey: "coverUrl",
    header: "영상링크",
    cell: ({ row }) => {
      const coverUrl = row.getValue("coverUrl") as string
      return (
        <Link href={coverUrl} className="z-50">
          <MdOpenInNew size={24} />
        </Link>
      )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <BsThreeDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none text-sm">
            <DropdownMenuItem className="p-0">
              <Link
                href={ROUTES.TEAM.EDIT.url(row.original.id.toString())}
                className="flex h-full w-full items-center justify-center gap-x-2 px-6 py-2"
              >
                <GoPencil />
                편집하기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link
                href="#" // TODO: 삭제 로직 추가
                className="flex h-full w-full items-center justify-center gap-x-2 px-6 py-2"
              >
                <GoTrash />
                삭제하기
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
