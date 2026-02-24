"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { formatGenerationOrder } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

// publicUser 타입: { id, name, image, nickname, bio, generation: { order } }
interface PublicUser {
  id: number
  name: string
  image: string | null
  nickname: string
  bio: string | null
  generation: { order: number }
}

export function getColumns(): ColumnDef<PublicUser>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 60
    },
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.image ?? undefined} />
          <AvatarFallback>{row.original.name[0]}</AvatarFallback>
        </Avatar>
      ),
      size: 40
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
      id: "generation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      accessorFn: (row) => row.generation.order,
      cell: ({ row }) =>
        `${formatGenerationOrder(row.original.generation.order)}기`
    },
    {
      id: "actions",
      cell: () => (
        // TODO: 백엔드에 PATCH /users/:id, DELETE /users/:id 엔드포인트 추가 후 활성화
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <Pencil className="mr-2 h-4 w-4" />
              편집 (API 미구현)
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제 (API 미구현)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50
    }
  ]
}
