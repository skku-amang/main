"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import { UserCell } from "@/app/(admin)/_components/data-table/UserCell"
import { formatGenerationOrder } from "@/lib/utils"
import ROUTES from "@/constants/routes"
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

interface ColumnOptions {
  userOptions?: { label: string; value: string }[]
}

export function getColumns(
  actions: ColumnActions,
  options?: ColumnOptions
): ColumnDef<GenerationWithBasicUsers>[] {
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
      accessorKey: "order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      meta: {
        label: "기수",
        editable: {
          type: "number",
          step: 0.5,
          displayTransform: (v: number) => String(v / 2),
          saveTransform: (v: number) => v * 2
        }
      },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={`${formatGenerationOrder(ctx.row.original.order)}기`}
        />
      )
    },
    {
      id: "leader",
      accessorFn: (row) => row.leader?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기장" />
      ),
      meta: {
        label: "기장",
        editable: {
          type: "select",
          options: options?.userOptions ?? []
        }
      },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={<UserCell user={ctx.row.original.leader} />}
        />
      )
    },
    {
      id: "memberCount",
      accessorFn: (row) => row.users.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="회원 수" />
      ),
      meta: { label: "회원 수" },
      cell: ({ row }) => (
        <Link
          href={`${ROUTES.ADMIN.USERS}?generation=${row.original.order}`}
          className="text-blue-600 hover:underline"
        >
          {row.original.users.length}명
        </Link>
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
