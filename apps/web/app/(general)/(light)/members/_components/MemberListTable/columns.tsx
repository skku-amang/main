"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSessionDisplayName } from "@/constants/session"
import { Session, User } from "@repo/shared-types"

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
    <Badge className="rounded-lg bg-slate-200 text-black">
      {getSessionDisplayName(session.name)}
    </Badge>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton column={column}>이름</SortButton>,
    cell: ({ row }) => (
      <div>
        {row.getValue("name")}
        <br />
        <span className="text-slate-600">{row.original.email}</span>
      </div>
    )
  },
  {
    accessorKey: "generationId",
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <SortButton column={column}>기수</SortButton>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.generationId}기
        <br />
      </div>
    )
  },
  {
    accessorKey: "sessions",
    header: "세션",
    cell: ({ row }) => {
      const UserSessions = row.getValue("sessions") as Session[]
      return (
        <div className="flex justify-start gap-1 text-right font-medium">
          {UserSessions.map((session) => (
            <SessionBadge key={session.name} session={session} />
          ))}
        </div>
      )
    }
  }
]

// TODO: genre와 likedArtists 필드는 User 타입에 추가 후 컬럼 복원 필요
