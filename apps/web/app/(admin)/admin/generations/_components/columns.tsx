"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { formatGenerationOrder } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { GenerationWithBasicUsers } from "@repo/shared-types"

interface ColumnActions {
  onEdit: (generation: GenerationWithBasicUsers) => void
  onDelete: (generation: GenerationWithBasicUsers) => void
}

export function getColumns(
  actions: ColumnActions
): ColumnDef<GenerationWithBasicUsers>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 60
    },
    {
      accessorKey: "order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      cell: ({ row }) => `${formatGenerationOrder(row.original.order)}기`
    },
    {
      id: "leader",
      header: "리더",
      cell: ({ row }) => row.original.leader?.name ?? "-"
    },
    {
      id: "memberCount",
      header: "회원 수",
      cell: ({ row }) => row.original.users.length
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
