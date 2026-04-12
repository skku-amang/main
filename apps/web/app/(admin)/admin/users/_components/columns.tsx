"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import { formatGenerationOrder } from "@/lib/utils"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { publicUser } from "@repo/shared-types"

interface ColumnCallbacks {
  onEdit: (user: publicUser) => void
  onDelete: (user: publicUser) => void
}

export function getColumns({
  onEdit,
  onDelete
}: ColumnCallbacks): ColumnDef<publicUser>[] {
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
      id: "avatar",
      header: "프로필",
      cell: ({ row }) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.image ?? undefined} />
          <AvatarFallback>{row.original.name[0]}</AvatarFallback>
        </Avatar>
      ),
      size: 40,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="이름" />
      ),
      meta: { label: "이름", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.getValue() as string}
        />
      )
    },
    {
      accessorKey: "nickname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="닉네임" />
      ),
      meta: { label: "닉네임", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={ctx.getValue() as string}
        />
      )
    },
    {
      accessorKey: "bio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="소개" />
      ),
      meta: { label: "소개", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={
            <span className="max-w-[200px] truncate">
              {ctx.row.original.bio ?? "-"}
            </span>
          }
        />
      )
    },
    {
      id: "generation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      meta: { label: "기수", editable: { type: "generation" } },
      accessorFn: (row) => row.generation.id,
      sortingFn: (a, b) =>
        a.original.generation.order - b.original.generation.order,
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={
            <span>
              {formatGenerationOrder(ctx.row.original.generation.order)}기
            </span>
          }
        />
      ),
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.generation.order) === filterValue
    },
    {
      id: "sessions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="세션" />
      ),
      meta: { label: "세션" },
      accessorFn: (row) => row.sessions.map((s) => s.name).join(", "),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.sessions.length > 0
            ? row.original.sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`${ROUTES.ADMIN.SESSIONS}?rowId=${s.id}`}
                  className="hover:opacity-80"
                >
                  <Badge variant="outline" className="text-xs">
                    {getSessionDisplayName(s.name)}
                  </Badge>
                </Link>
              ))
            : "-"}
        </div>
      ),
      filterFn: (row, _columnId, filterValue) =>
        row.original.sessions.some((s) => s.name === filterValue)
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
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(row.original)}
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
