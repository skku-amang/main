"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { EllipsisVertical, ExternalLink, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { CopyRowLinkItem } from "@/app/(admin)/_components/data-table/CopyRowLinkItem"
import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { EditableCell } from "@/app/(admin)/_components/data-table/EditableCell"
import PerformanceStageBadge from "@/components/PerformanceStageBadge"
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

// 진행 순서대로 — 공연 편집 창의 타임라인과 같은 순서
const SCHEDULE_COLUMNS = [
  ["recruitStartAt", "모집 시작"],
  ["recruitEndAt", "모집 종료"],
  ["feedbackStartAt", "피드백 시작"],
  ["feedbackEndAt", "피드백 종료"],
  ["startAt", "공연 시작"],
  ["endAt", "공연 종료"]
] as const

export const SCHEDULE_COLUMN_KEYS: readonly string[] = SCHEDULE_COLUMNS.map(
  ([key]) => key
)

function dateColumn(
  key: (typeof SCHEDULE_COLUMNS)[number][0],
  label: string
): ColumnDef<Performance> {
  return {
    accessorKey: key,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={label} />
    ),
    meta: { label, editable: { type: "date" } },
    cell: (ctx) => {
      const value = ctx.row.original[key]
      return (
        <EditableCell
          cellContext={ctx}
          displayValue={
            value ? format(new Date(value), "yyyy-MM-dd HH:mm") : "-"
          }
        />
      )
    }
  }
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
      accessorKey: "image",
      header: "포스터",
      meta: { label: "포스터", editable: { type: "image" } },
      cell: (ctx) => (
        <EditableCell
          cellContext={ctx}
          displayValue={
            ctx.row.original.image ? (
              <img
                src={ctx.row.original.image}
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
    ...SCHEDULE_COLUMNS.map(([key, label]) => dateColumn(key, label)),
    {
      id: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="단계" />
      ),
      meta: { label: "단계" },
      cell: ({ row }) => <PerformanceStageBadge performance={row.original} />
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
