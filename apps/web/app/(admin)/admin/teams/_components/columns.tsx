"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, EllipsisVertical, Trash2 } from "lucide-react"
import Link from "next/link"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { TeamList } from "@repo/shared-types"

type TeamItem = TeamList[number]

interface ColumnActions {
  onDelete: (team: TeamItem) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<TeamItem>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 60
    },
    {
      accessorKey: "songName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="곡명" />
      ),
      cell: ({ row }) => (
        <Link
          href={ROUTES.ADMIN.TEAM_DETAIL(row.original.id)}
          className="text-blue-600 hover:underline"
        >
          {row.original.songName}
        </Link>
      )
    },
    {
      accessorKey: "songArtist",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="아티스트" />
      )
    },
    {
      id: "leader",
      header: "리더",
      cell: ({ row }) => (
        <Link
          href={ROUTES.ADMIN.USERS}
          className="text-blue-600 hover:underline"
        >
          {row.original.leader.name}
        </Link>
      )
    },
    {
      id: "fillRate",
      header: "충원율",
      cell: ({ row }) => {
        const sessions = row.original.teamSessions
        const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)
        const totalMembers = sessions.reduce(
          (sum, s) => sum + s.members.length,
          0
        )
        const isFull = totalMembers >= totalCapacity

        return (
          <Badge variant={isFull ? "default" : "secondary"}>
            {totalMembers}/{totalCapacity}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ADMIN.TEAM_DETAIL(row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                상세/편집
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onDelete(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50
    }
  ]
}
