"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, ExternalLink, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
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

interface PublicUser {
  id: number
  name: string
  image: string | null
  nickname: string
  bio: string | null
  generation: { id: number; order: number }
  sessions: { id: number; name: string }[]
}

export function getColumns(): ColumnDef<PublicUser>[] {
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
      meta: { label: "이름" }
    },
    {
      accessorKey: "nickname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="닉네임" />
      ),
      meta: { label: "닉네임" }
    },
    {
      accessorKey: "bio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="소개" />
      ),
      meta: { label: "소개" },
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate">
          {row.original.bio ?? "-"}
        </span>
      )
    },
    {
      id: "generation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="기수" />
      ),
      meta: { label: "기수" },
      accessorFn: (row) => row.generation.order,
      cell: ({ row }) => (
        <Link
          href={`${ROUTES.ADMIN.GENERATIONS}?rowId=${row.original.generation.id}`}
          className="text-blue-600 hover:underline"
        >
          {formatGenerationOrder(row.original.generation.order)}기
        </Link>
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
            <DropdownMenuItem asChild>
              <Link href={ROUTES.MEMBER.DETAIL(row.original.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                바로가기
              </Link>
            </DropdownMenuItem>
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
      size: 50,
      enableHiding: false
    }
  ]
}
