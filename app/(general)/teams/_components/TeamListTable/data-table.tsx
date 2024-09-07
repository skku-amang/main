'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import Link from 'next/link'
import { useState } from 'react'
import { CiCirclePlus } from 'react-icons/ci'
import { TbFilter } from 'react-icons/tb'

import FilterSection, { FilterLabel } from '@/components/Filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { TeamColumn } from './columns'

interface DataTableProps<TValue> {
  columns: ColumnDef<TeamColumn, TValue>[]
  data: TeamColumn[]
}

const Example_Filter_array: FilterLabel[] = [
  { id: 1, label: '모두' },
  { id: 2, label: '보컬 1' },
  { id: 3, label: '보컬 2' },
  { id: 4, label: '기타 1' },
  { id: 5, label: '기타 2' },
  { id: 6, label: '신디 1' },
  { id: 7, label: '신디 2' },
  { id: 8, label: '베이스' },
  { id: 9, label: '드럼' },
  { id: 10, label: '현악기' },
  { id: 11, label: '관악기' }
]

const Example_Filter_array2: FilterLabel[] = [
  { id: 1, label: '모두' },
  { id: 2, label: 'Active' },
  { id: 3, label: 'InActive' }
]

export function TeamListDataTable<TValue>({
  columns,
  data
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  const [filter, setFilter] = useState(false)
  const toggleFilter = () => setFilter((prev) => !prev)

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="검색"
          value={
            (table.getColumn('songName')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('songName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <div className="relative flex gap-3">
          <Button asChild className="h-8 rounded-md py-1">
            <Link href="teams/create">
              <CiCirclePlus size={22} />
              &nbsp;Create
            </Link>
          </Button>
          <Button className="h-8 rounded-md py-1" onClick={toggleFilter}>
            <TbFilter size={22} />
            &nbsp;Filter
          </Button>
          {filter && (
            <div className="absolute right-0 top-11 z-50 flex h-[21rem] w-[30rem] rounded-sm bg-white shadow-xl">
              <FilterSection
                header="세션"
                filterObject={Example_Filter_array}
              />
              <FilterSection
                header="모집상태"
                filterObject={Example_Filter_array2}
              />
            </div>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-sm border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-gray-700 font-bold text-white"
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
                  data-state={row.getIsSelected() && 'selected'}
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
      {/* 다음 창으로 이동 버튼 */}
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
