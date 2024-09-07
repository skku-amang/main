"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import React from "react"

import { Session } from "@/types/Session"
import { User } from "@/types/User"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"


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

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton column={column}>이름</SortButton>,
    cell: ({ row }) => (
        <div>
          {row.getValue("name")}<br/>
          <span className="text-slate-600">{row.original.email}</span>
        </div>
    ),
  },
  {
    accessorKey: "generation",
    header: ({ column }) => <div className="w-full flex justify-center"><SortButton column={column}>기수</SortButton></div>,
    cell: ({ row }) => (
        <div className="text-center">
          {row.original.generation.order}<br/>
        </div>
    ),
  },
  {
    accessorKey: "sessions",
    header: "세션",
    cell: ({ row }) => {
      const UserSessions  = row.getValue("sessions") as Session[];
      return <div className="flex justify-start text-right font-medium gap-1">{UserSessions.map((session) => (
        <SessionBadge key={session.name} session={session} />
      ))}</div>
    },
  },
  {
    accessorKey: "genre",
    header: "선호 장르",
    cell: ({ row }) => {
      return <div className="flex justify-start text-right font-medium gap-1"> 
        <Badge className="p-2 px-3 bg-slate-200 text-black">
          {row.original.genre}
        </Badge>
      </div>
    },
  },
  {
    accessorKey: "liked_artists",
    header: "최애 아티스트",
    cell: ({ row }) => {
      return <div className="flex justify-start text-right font-medium gap-1"> 
        <div>
          {row.original.liked_artists}
        </div>
      </div>
    },
  }
];

