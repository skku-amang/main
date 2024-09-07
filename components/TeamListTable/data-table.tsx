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

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import { TeamColumn } from './columns'
import { Check } from 'lucide-react'
import dummySessions from '@/lib/dummy/Session'
import { Checkbox } from '../ui/checkbox'

interface DataTableProps<TValue> {
  columns: ColumnDef<TeamColumn, TValue>[]
  data: TeamColumn[]
}


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

  const [filter, setfilter] = useState(false);
  const openfilter = () => setfilter(!filter);
  const sessions = dummySessions;

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

        <div className="flex relative gap-3">
          <Button asChild className="h-8 rounded-md py-1">
            <Link href="teams/create">
              <CiCirclePlus size={22} />
              &nbsp;Create
            </Link>
          </Button>
          <Button className="h-8 rounded-md py-1" onClick={openfilter}>
            <TbFilter size={22} />
            &nbsp;Filter
          </Button>
          {filter && (
          <div className='flex absolute rounded-sm right-0 top-11 w-[30rem] h-[24rem] shadow-xl z-50 bg-white'>
            
            {/* 좌측 박스, 필요세션 (모두, 보컬12, 기타123, 신디12, 베이스, 드럼, 현악기, 관악기) */}
            <div className='relative flex-col w-[16rem] h-full '>
              <div className='absolute left-9 top-5 font-semibold text-blue-950 text-lg'>필요세션</div>
              {/* 좌측박스 체크박스 들어가는 부분 전체 */}
              <div className="flex justify-center absolute left-0 top-16 w-[16rem] h-[22rem] ">
                <div className="flex items-center justify-center gap-[1.5rem] w-[13rem] h-[20rem]">
                  <div className='flex flex-col w-[5rem] gap-[0.55rem] h-full '>
                    <div className='flex gap-2 items-center font-medium  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>모두</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>보컬1</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>보컬2</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>기타1</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>기타2</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>신디1</label>
                    </div>
                  </div>
                  <div className='flex flex-col w-[5rem] gap-[0.55rem] h-full'>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>신디2</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>베이스</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>드럼</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>현악기</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>관악기</label>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
  
            {/* 우측 박스, 모집상태 (모두, active, inactive) */}
            <div className='relative w-[14rem] h-full border-l-[0.1rem] border-l-slate-100 '>
              <div className='absolute left-6 top-5 font-semibold text-blue-950 text-lg'>모집상태</div>
              <div className="flex justify-center absolute left-0 top-16 w-full h-[22rem] ">
                <div className="flex items-center justify-start pl-4 w-[13rem] h-[20rem]">
                  <div className='flex flex-col w-[5rem] gap-[0.55rem] h-full '>
                  <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>모두</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>Active</label>
                    </div>
                    <div className='flex gap-2 items-center  w-full h-[2.6rem]' >
                      <Checkbox/>
                      <label>Inactive</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
          }
          </div>
      

      </div>
      <div className="overflow-hidden rounded-md">
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
