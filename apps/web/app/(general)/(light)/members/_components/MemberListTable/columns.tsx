"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatGenerationOrder } from "@/lib/utils"
import { Session } from "@/types/Session"
import { User } from "@/types/User"

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
    accessorKey: "generation",
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <SortButton column={column}>기수</SortButton>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatGenerationOrder(row.original.generation.order)}
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
  },
  {
    accessorKey: "genre",
    header: "선호 장르",
    cell: ({ row }) => {
      return (
        <div className="flex justify-start gap-1 text-right font-medium">
          <Badge className="bg-slate-200 p-2 px-3 text-black">
            {row.original.genre}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "likedArtists",
    header: "최애 아티스트",
    cell: ({ row }) => {
      return (
        <div className="flex justify-start gap-1 text-right font-medium">
          <div>{row.original.likedArtists}</div>
        </div>
      )
    }
  }
]
