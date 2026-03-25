"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

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
import { RentalDetail } from "@repo/shared-types"

interface ColumnActions {
  onEdit: (rental: RentalDetail) => void
  onDelete: (rental: RentalDetail) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<RentalDetail>[] {
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="예약명" />
      ),
      meta: {
        label: "예약명",
        editable: { type: "text" }
      },
      cell: (ctx) => (
        <EditableCell cellContext={ctx} displayValue={ctx.row.original.title} />
      )
    },
    {
      id: "equipment",
      accessorFn: (row) =>
        row.equipment ? `${row.equipment.brand} ${row.equipment.model}` : "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="장비" />
      ),
      meta: { label: "장비" },
      cell: ({ row }) =>
        row.original.equipment
          ? `${row.original.equipment.brand} ${row.original.equipment.model}`
          : "-"
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="시작 시간" />
      ),
      meta: { label: "시작 시간" },
      cell: ({ row }) =>
        format(new Date(row.original.startAt), "yyyy-MM-dd HH:mm")
    },
    {
      accessorKey: "endAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="종료 시간" />
      ),
      meta: { label: "종료 시간" },
      cell: ({ row }) =>
        format(new Date(row.original.endAt), "yyyy-MM-dd HH:mm")
    },
    {
      id: "participantCount",
      accessorFn: (row) => row.users.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="참여자 수" />
      ),
      meta: { label: "참여자 수" },
      cell: ({ row }) => `${row.original.users.length}명`
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="생성일" />
      ),
      meta: { label: "생성일" },
      cell: ({ row }) => format(new Date(row.original.createdAt), "yyyy-MM-dd")
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
