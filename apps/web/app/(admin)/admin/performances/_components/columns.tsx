"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { EllipsisVertical, ExternalLink, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { Performance } from "@repo/shared-types"

interface ColumnActions {
  onEdit: (performance: Performance) => void
  onDelete: (performance: Performance) => void
}

export function getColumns(
  actions: ColumnActions,
  teamCountMap?: Map<number, number>
): ColumnDef<Performance>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 60,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="공연명" />
      ),
      meta: { label: "공연명", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell cellContext={ctx} displayValue={ctx.row.original.name} />
      )
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="설명" />
      ),
      meta: { label: "설명", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={
            <span className="max-w-[200px] truncate">
              {ctx.row.original.description ?? "-"}
            </span>
          }
        />
      )
    },
    {
      accessorKey: "posterImage",
      header: "포스터",
      meta: { label: "포스터", editable: { type: "image" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={
            ctx.row.original.posterImage ? (
              <img
                src={ctx.row.original.posterImage}
                alt="포스터"
                className="h-10 w-8 rounded object-cover"
              />
            ) : (
              "-"
            )
          }
        />
      )
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="장소" />
      ),
      meta: { label: "장소", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.row.original.location ?? "-"}
        />
      ),
      filterFn: (row, _columnId, filterValue) =>
        row.original.location === filterValue
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="시작일" />
      ),
      meta: { label: "시작일", editable: { type: "date" } },
      cell: (ctx) => {
        const startAt = ctx.row.original.startAt
        return (
          <EditableCell
            cellContext={ctx}
            displayValue={
              startAt ? format(new Date(startAt), "yyyy-MM-dd HH:mm") : "-"
            }
          />
        )
      }
    },
    {
      accessorKey: "endAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="종료일" />
      ),
      meta: { label: "종료일", editable: { type: "date" } },
      cell: (ctx) => {
        const endAt = ctx.row.original.endAt
        return (
          <EditableCell
            cellContext={ctx}
            displayValue={
              endAt ? format(new Date(endAt), "yyyy-MM-dd HH:mm") : "-"
            }
          />
        )
      }
    },
    {
      id: "teamCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="팀 수" />
      ),
      meta: { label: "팀 수" },
      accessorFn: (row) => teamCountMap?.get(row.id) ?? 0,
      cell: ({ row }) => {
        const count = teamCountMap?.get(row.original.id) ?? 0
        return (
          <Link
            href={`${ROUTES.ADMIN.TEAMS}?performanceId=${row.original.id}`}
            className="text-blue-600 hover:underline"
          >
            {count}팀
          </Link>
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
            <CopyRowLinkItem rowId={row.original.id} />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.PERFORMANCE.DETAIL(row.original.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                바로가기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              편집
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
