"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Check, Trash2 } from "lucide-react"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSessionDisplayName } from "@/constants/session"
import { formatGenerationOrder } from "@/lib/utils"
import { DetailedUser } from "@repo/shared-types"

interface ColumnCallbacks {
  onApprove: (user: DetailedUser) => void
  onDelete: (user: DetailedUser) => void
}

export function getColumns({
  onApprove,
  onDelete
}: ColumnCallbacks): ColumnDef<DetailedUser>[] {
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
      )
    },
    {
      accessorKey: "nickname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="닉네임" />
      )
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="이메일" />
      )
    },
    {
      id: "generation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      accessorFn: (row) => row.generation.order,
      cell: ({ row }) =>
        `${formatGenerationOrder(row.original.generation.order)}기`,
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.generation.order) === filterValue
    },
    {
      id: "sessions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="세션" />
      ),
      accessorFn: (row) => row.sessions.map((s) => s.name).join(", "),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.sessions.length > 0
            ? row.original.sessions.map((s) => (
                <Badge key={s.id} variant="outline" className="text-xs">
                  {getSessionDisplayName(s.name)}
                </Badge>
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onApprove(row.original)}
          >
            <Check className="mr-1 h-4 w-4" />
            승인
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            삭제
          </Button>
        </div>
      ),
      size: 180,
      enableHiding: false
    }
  ]
}
