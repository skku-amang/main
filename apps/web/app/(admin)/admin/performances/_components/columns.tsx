"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Performance } from "@repo/shared-types"

interface ColumnActions {
  onEdit: (performance: Performance) => void
  onDelete: (performance: Performance) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<Performance>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 60
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="공연명" />
      )
    },
    {
      accessorKey: "location",
      header: "장소",
      cell: ({ row }) => row.original.location ?? "-"
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="시작일" />
      ),
      cell: ({ row }) => {
        const startAt = row.original.startAt
        return startAt ? format(new Date(startAt), "yyyy-MM-dd HH:mm") : "-"
      }
    },
    {
      accessorKey: "endAt",
      header: "종료일",
      cell: ({ row }) => {
        const endAt = row.original.endAt
        return endAt ? format(new Date(endAt), "yyyy-MM-dd HH:mm") : "-"
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
      size: 50
    }
  ]
}
