"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, EllipsisVertical, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import { UserCell } from "@/app/(admin)/_components/data-table/UserCell"
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

export function getColumns(
  actions: ColumnActions,
  performanceMap?: Map<number, string>
): ColumnDef<TeamItem>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={ROUTES.ADMIN.TEAM_DETAIL(row.original.id)}
          className="text-blue-600 hover:underline"
        >
          {row.original.id}
        </Link>
      ),
      size: 60,
      enableHiding: false
    },
    {
      id: "performanceId",
      accessorFn: (row) =>
        performanceMap?.get(row.performanceId) ?? String(row.performanceId),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="공연" />
      ),
      meta: { label: "공연" },
      cell: ({ row }) => (
        <Link
          href={`${ROUTES.ADMIN.PERFORMANCES}?rowId=${row.original.performanceId}`}
          className="text-blue-600 hover:underline"
        >
          {performanceMap?.get(row.original.performanceId) ??
            row.original.performanceId}
        </Link>
      ),
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.performanceId) === filterValue
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="팀명" />
      ),
      meta: { label: "팀명", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.getValue() as string}
        />
      )
    },
    {
      accessorKey: "songName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="곡명" />
      ),
      cell: (cellContext) => (
        <EditableCell
          cellContext={cellContext}
          displayValue={cellContext.getValue() as string}
        />
      ),
      meta: {
        label: "곡명",
        editable: { type: "text" }
      }
    },
    {
      accessorKey: "songArtist",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="아티스트" />
      ),
      cell: (cellContext) => (
        <EditableCell
          cellContext={cellContext}
          displayValue={cellContext.getValue() as string}
        />
      ),
      meta: {
        label: "아티스트",
        editable: { type: "text" }
      },
      filterFn: (row, _columnId, filterValue) =>
        row.original.songArtist === filterValue
    },
    {
      id: "leader",
      accessorFn: (row) => row.leader.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="리더" />
      ),
      meta: { label: "리더" },
      cell: ({ row }) => <UserCell user={row.original.leader} />,
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.leader.id) === filterValue
    },
    {
      id: "fillRate",
      accessorFn: (row) => {
        const total = row.teamSessions.reduce((s, ts) => s + ts.capacity, 0)
        if (total === 0) return 0
        const filled = row.teamSessions.reduce(
          (s, ts) => s + ts.members.length,
          0
        )
        return filled / total
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="충원율" />
      ),
      meta: { label: "충원율" },
      cell: ({ row }) => {
        const sessions = row.original.teamSessions
        const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)
        const totalMembers = sessions.reduce(
          (sum, s) => sum + s.members.length,
          0
        )
        const isFull = totalMembers >= totalCapacity

        return (
          <Badge variant={isFull ? "default" : "outline"}>
            {totalMembers}/{totalCapacity}
          </Badge>
        )
      }
    },
    {
      accessorKey: "isFreshmenFixed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="신입생 고정" />
      ),
      meta: { label: "신입생 고정", editable: { type: "boolean" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.row.original.isFreshmenFixed ? "O" : "-"}
        />
      )
    },
    {
      accessorKey: "isSelfMade",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="자작곡" />
      ),
      meta: { label: "자작곡", editable: { type: "boolean" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.row.original.isSelfMade ? "O" : "-"}
        />
      )
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
            <CopyRowLinkItem rowId={row.original.id} />
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
      size: 50,
      enableHiding: false
    }
  ]
}
