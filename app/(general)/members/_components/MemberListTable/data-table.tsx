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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
import ROUTES from '@/constants/routes'
import { User } from '@/types/User'

interface DataTableProps<TValue> {
  columns: ColumnDef<User, TValue>[]
  data: User[]
}

const ExampleFilterArray: FilterLabel[] = [
  { id: 1, label: '모두' },
  { id: 2, label: '보컬 1' },
  { id: 3, label: '기타' },
  { id: 4, label: '신디' },
  { id: 5, label: '베이스' },
  { id: 6, label: '드럼' }
]

export function MemberListDataTable<TValue>({
  columns,
  data
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const router = useRouter()

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
  const toggleFilter = () => setFilter(!filter)

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="검색"
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <div className="relative flex gap-3">
          <Button className="h-8 rounded-md py-1" onClick={toggleFilter}>
            <TbFilter size={22} />
            &nbsp;Filter
          </Button>
          {filter && (
            <div className="absolute right-0 top-11 z-50 flex h-[21rem] w-[15rem] rounded-sm bg-white shadow-xl">
              <FilterSection
                header="세션"
                filterObject={ExampleFilterArray}
              />
            </div>
          )}
        </div>
      </div>
      <div className="rounded-md border">
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
                  className="hover:cursor-pointer"
                  onClick={() =>
                    router.push(
                      ROUTES.MEMBER.DETAIL.url(row.original.id.toString())
                    )
                  }
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
