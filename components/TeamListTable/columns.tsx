"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import React from "react"
import { MdOpenInNew } from "react-icons/md"
import { useRouter } from 'next/navigation'
import ROUTES from '@/constants/routes'

import { cn } from "../../lib/utils"
import { Session } from "../../types/Session"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"

type TeamStatus = "모집 완료" | "모집 중"
export type TeamColumn = {
  id: number
  songName: string
  songArtist: string
  leaderName: string
  // requiredSessions: Session[]
  cover_url: string
  is_freshmanFixed: boolean
}

const SortButton = ({ column, children }: { column: any, children: React.ReactNode }) => {
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
  const className = status === "모집 완료" ?
  "bg-red-100 border-destructive text-destructive "
  :
  "bg-green-100 border-green-600 text-green-600 "
  return (
    <div className="flex justify-center">
      <Badge
        variant="outline"
        className={cn(className, "border rounded-lg font-bold")}>
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
        <div>
          {row.getValue("songName")}<br/>
          <span className="text-slate-300">{row.original.songArtist}</span>
        </div>
    ),
  },
  {
    accessorKey: "leaderName",
    header: ({ column }) => <div className="w-full flex justify-center"><SortButton column={column}>팀장</SortButton></div>,
    cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("leaderName")}<br/>
          {row.original.is_freshmanFixed &&
            <Badge className="py-0 bg-blue-900">신입고정</Badge>
          }
        </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      const router = useRouter()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end"> 
            <DropdownMenuItem onClick={(event) =>
              {
              event.preventDefault();
              }}>
             편집하기
            </DropdownMenuItem>
            <DropdownMenuItem>삭제하기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

  // {
  //   accessorKey: "requiredSessions",
  //   header: "필요 세션",
  //   cell: ({ row }) => {
  //     const requiredSessions = row.getValue("requiredSessions") as Session[]
  //     return <div className="flex justify-start text-right font-medium gap-1">{requiredSessions.map((session) => (
  //       <SessionBadge key={session.name} session={session} />
  //     ))}</div>
  //   },
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => <div className="w-full flex justify-center"><SortButton column={column}>모집상태</SortButton></div>,
  //   cell: ({ row }) => {
  //     const status: TeamStatus = row.original.requiredSessions.length === 0 ? "모집 완료" : "모집 중"
  //     return (
  //       <StatusBadge status={status}/>
  //     )
  //   },
  // },
  
