"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Session } from "../../../types/Session"
import { Button } from "../ui/button"
import { ArrowUpDown } from "lucide-react"
import { Badge } from "../ui/badge"
import Link from "next/link"
import { MdOpenInNew } from "react-icons/md"
import { cn } from "@/lib/utils"
import React from "react"
import { User } from "../../../types/User"


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
  }
]
