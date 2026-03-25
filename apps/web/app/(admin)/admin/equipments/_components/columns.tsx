"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Check, EllipsisVertical, Pencil, Trash2, X } from "lucide-react"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Equipment } from "@repo/shared-types"

const CATEGORY_LABELS: Record<string, string> = {
  ROOM: "동아리방",
  SYNTHESIZER: "신디사이저",
  MICROPHONE: "마이크",
  GUITAR: "기타",
  BASS: "베이스",
  DRUM: "드럼",
  AUDIO_INTERFACE: "오디오 인터페이스",
  CABLE: "케이블",
  AMPLIFIER: "앰프",
  SPEAKER: "스피커",
  MIXER: "믹서",
  ETC: "기타(기타)"
}

interface ColumnActions {
  onEdit: (equipment: Equipment) => void
  onDelete: (equipment: Equipment) => void
}

export function getColumns(actions: ColumnActions): ColumnDef<Equipment>[] {
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
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="브랜드" />
      ),
      meta: { label: "브랜드", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell cellContext={ctx} displayValue={ctx.row.original.brand} />
      )
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="모델" />
      ),
      meta: { label: "모델", editable: { type: "text" } },
      cell: (ctx) => (
        <EditableCell cellContext={ctx} displayValue={ctx.row.original.model} />
      )
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="카테고리" />
      ),
      meta: { label: "카테고리" },
      cell: ({ row }) => (
        <Badge variant="outline">
          {CATEGORY_LABELS[row.original.category] ?? row.original.category}
        </Badge>
      ),
      filterFn: (row, _id, filterValue) => {
        if (!filterValue) return true
        return row.original.category === filterValue
      }
    },
    {
      accessorKey: "isAvailable",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="사용 가능" />
      ),
      meta: { label: "사용 가능" },
      cell: ({ row }) =>
        row.original.isAvailable ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        ),
      size: 80
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
              {ctx.row.original.description || "-"}
            </span>
          }
        />
      )
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
