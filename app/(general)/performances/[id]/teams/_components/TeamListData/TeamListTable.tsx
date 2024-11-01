"use client"

import { ColumnDef, flexRender, useReactTable } from "@tanstack/react-table"
import { CirclePlus, Filter } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import RelatedPerformanceList from "@/app/(general)/performances/[id]/teams/_components/RelatedPerformanceList"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/(general)/performances/[id]/teams/_components/TeamListData/BaseTable"
import { TeamColumn } from "@/app/(general)/performances/[id]/teams/_components/TeamListData/columns"
import TeamListTableFilter, { FilterValue } from "@/app/(general)/performances/[id]/teams/_components/TeamListData/filter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"
import { Performance } from "@/types/Performance"

interface TeamListTableProps {
  table: ReturnType<typeof useReactTable<TeamColumn>>
  performanceId: number
  relatedPerformances: Performance[]
  columns: ColumnDef<TeamColumn, any>[]
  filterValues: { [key: string]: FilterValue[] }
}

const TeamListTable = ({
  table,
  performanceId,
  relatedPerformances,
  columns,
  filterValues
}: TeamListTableProps) => {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div>
      {/* 연관된 공연 목록 */}
      <div className="flex w-full items-center justify-center">
        <RelatedPerformanceList
          currentPerformanceId={performanceId}
          relatedPerformances={relatedPerformances}
        />
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between py-4">
        {/* 검색 */}
        <Input
          placeholder="검색"
          value={
            (table.getColumn("songName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("songName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* 생성 및 필터 */}
        <div className="relative flex gap-3">
          {/* 생성 버튼 */}
          <Button asChild className="h-8 rounded-md py-1">
            <Link href={ROUTES.TEAM.CREATE.url}>
              <CirclePlus size={22} />
              &nbsp;Create
            </Link>
          </Button>

          {/* 필터 */}
          <Popover open={filterOpen}>
            <PopoverTrigger>
              <Button
                asChild
                className="h-8 rounded-md py-1"
                onClick={() => setFilterOpen(true)}
                variant={filterOpen ? "outline" : undefined}
              >
                <div>
                  <Filter size={22} />
                  &nbsp;Filter
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              onInteractOutside={() => setFilterOpen(false)}
              className="flex gap-8 p-8"
            >
              <TeamListTableFilter
                header="필요세션"
                filterValues={filterValues.필요세션}
              />
              <Separator orientation="vertical" className="h-64" />
              <TeamListTableFilter
                header="모집상태"
                filterValues={filterValues.모집상태}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-zinc-700 font-bold text-white"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default TeamListTable
