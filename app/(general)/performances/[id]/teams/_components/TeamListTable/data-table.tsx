"use client"

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
} from "@tanstack/react-table"
import { ArrowDownUp, CirclePlus, Filter, Plus, X } from "lucide-react"
import Link from "next/link"
import { useReducer, useState } from "react"

import RelatedPerformanceList from "@/app/(general)/performances/[id]/teams/_components/RelatedPerformanceList"
import TeamCard from "@/app/(general)/performances/[id]/teams/_components/TeamCard"
import TeamListTableFilter, {
  FilterValue
} from "@/app/(general)/performances/[id]/teams/_components/TeamListTable/filter"
import MobileButton from "@/app/(general)/performances/[id]/teams/_components/TeamListTable/MobileButton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/(general)/performances/[id]/teams/_components/TeamListTable/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import { Performance } from "@/types/Performance"
import { MemberSession, MemberSessionSet } from "@/types/Team"

import { TeamColumn } from "./columns"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"

type State = {
  filters: { 필요세션: Set<string>; 모집상태: "all" | "active" | "inactive" }
  result: TeamColumn[]
  originalData: TeamColumn[]
}
type Action =
  | {
      type: "addFilter"
      payload: { target: keyof State["filters"]; value: string }
    }
  | {
      type: "removeFilter"
      payload: { target: keyof State["filters"]; value: string }
    }
  | { type: "clearFilter"; payload: { target: keyof State["filters"] } }
  | {
      type: "setFilter"
      payload: { target: "모집상태"; value: State["filters"]["모집상태"] }
    }
const reducer = (state: State, action: Action) => {
  let newState: State = { ...state }
  // 필터 추가
  switch (action.payload.target) {
    case "필요세션":
      switch (action.type) {
        case "clearFilter":
          newState = { ...state }
          newState.filters[action.payload.target] = new Set()
          break
        case "addFilter":
          state.filters[action.payload.target].add(action.payload.value)
          newState.filters[action.payload.target] = new Set(
            state.filters[action.payload.target]
          )
          break
        case "removeFilter":
          state.filters[action.payload.target].delete(action.payload.value)
          newState.filters[action.payload.target] = new Set(
            state.filters[action.payload.target]
          )
          break
        default:
          throw new TypeError(`Invalid action type`)
      }
      break
    case "모집상태":
      switch (action.type) {
        case "setFilter":
          newState = { ...state }
          newState.filters.모집상태 = action.payload.value
      }
      break
    default:
      throw new TypeError(`Invalid action type`)
  }

  // 실제 데이터에 반영

  // 모두 선택시 최적화
  if (
    newState.filters.필요세션.size === 0 &&
    newState.filters.모집상태 === "all"
  ) {
    return { ...newState, result: newState.originalData }
  }

  // 필터 값 존재시
  newState.result = state.originalData.filter((team) => {
    return Object.entries(newState.filters).every(
      ([filterKey, filterValues]) => {
        if (!team.memberSessions) return false
        switch (filterKey) {
          case "모집상태":
            if (filterValues === "active")
              return !new MemberSessionSet(team.memberSessions).isSatisfied
            if (filterValues === "inactive")
              return new MemberSessionSet(team.memberSessions).isSatisfied
            return true
          // eslint-disable-next-line no-fallthrough
          case "필요세션":
            if ((filterValues as Set<string>).size === 0) return true
            return new MemberSessionSet(team.memberSessions)
              .getSessionsWithMissingMembers()
              .some((ms) => {
                return (filterValues as Set<string>).has(ms.session)
              })
          default:
            throw new TypeError(`Invalid action type`)
        }
      }
    )
  })
  return newState
}

interface DataTableProps<TValue> {
  columns: ColumnDef<TeamColumn, TValue>[]
  data: TeamColumn[]
  relatedPerformances: Performance[]
  performanceId: number
}

export function TeamListDataTable<TValue>({
  columns,
  data,
  relatedPerformances,
  performanceId
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [filterOpen, setFilterOpen] = useState(false)
  const [state, dispatch] = useReducer(reducer, {
    filters: {
      모집상태: "all",
      필요세션: new Set()
    },
    result: data,
    originalData: data
  } as State)
  const filterValues: { [key: string]: FilterValue[] } = {
    필요세션: [
      {
        label: "모두",
        onChecked: () =>
          dispatch({ type: "clearFilter", payload: { target: "필요세션" } }),
        checked: state.filters.필요세션.size === 0
      },
      {
        label: "보컬",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "보컬" }
          }),
        checked: !!state.filters["필요세션"]?.has("보컬")
      },
      {
        label: "기타",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "기타" }
          }),
        checked: !!state.filters["필요세션"]?.has("기타")
      },
      {
        label: "신디",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "신디" }
          }),
        checked: !!state.filters["필요세션"]?.has("신디")
      },
      {
        label: "베이스",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "베이스" }
          }),
        checked: !!state.filters["필요세션"]?.has("베이스")
      },
      {
        label: "드럼",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "드럼" }
          }),
        checked: !!state.filters["필요세션"]?.has("드럼")
      },
      {
        label: "현악기",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "현악기" }
          }),
        checked: !!state.filters["필요세션"]?.has("현악기")
      },
      {
        label: "관악기",
        onChecked: (checked) =>
          dispatch({
            type: checked ? "addFilter" : "removeFilter",
            payload: { target: "필요세션", value: "관악기" }
          }),
        checked: !!state.filters["필요세션"]?.has("관악기")
      }
    ],
    모집상태: [
      {
        label: "모두",
        onChecked: () =>
          dispatch({
            type: "setFilter",
            payload: { target: "모집상태", value: "all" }
          }),
        checked: state.filters.모집상태 === "all"
      },
      {
        label: "Active",
        onChecked: (checked) =>
          dispatch({
            type: "setFilter",
            payload: { target: "모집상태", value: checked ? "active" : "all" }
          }),
        checked: state.filters["모집상태"] === "active"
      },
      {
        label: "Inactive",
        onChecked: (checked) =>
          dispatch({
            type: "setFilter",
            payload: { target: "모집상태", value: checked ? "inactive" : "all" }
          }),
        checked: state.filters["모집상태"] === "inactive"
      }
    ]
  }

  const table = useReactTable({
    data: state.result,
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

  const missingMemberSessions = (memberSessions: MemberSession[]) => {
    return new MemberSessionSet(memberSessions).getSessionsWithMissingMembers()
  }

  return (
    <div>
      {/* 데스크톱: 테이블 보기 */}
      <div className="hidden md:block">
        {/* 연관된 공연 목록 */}
        <div className="flex w-full items-center justify-center">
          <RelatedPerformanceList
            currentPerformanceId={performanceId}
            relatedPerformances={relatedPerformances}
          />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between pt-10">
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
              <Link href={ROUTES.PERFORMANCE.TEAM.CREATE(performanceId)}>
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
        <div>
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
        <div className="flex items-center justify-center space-x-2 pb-6 pt-14">
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

      {/* 모바일: 카드 보기 */}
      <div className="md:hidden">
        {/* 헤더 */}
        <div className="space-y-3">
          {/* 검색, 필터, 정렬 */}
          <div className="flex items-center justify-center gap-x-3">
            {/* 검색 */}
            <Input
              placeholder="검색"
              value={
                (table.getColumn("songName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("songName")?.setFilterValue(event.target.value)
              }
              className="h-9 w-full max-w-full border-gray-200 drop-shadow-search"
            />

            {/* 필터 */}
            <Drawer>
              <DrawerTrigger>
                <MobileButton asChild variant="outline">
                  <div className="h-9 w-9 drop-shadow-search">
                    <Filter className="text-gray-400" size={16} />
                  </div>
                </MobileButton>
              </DrawerTrigger>
              <DrawerContent className="px-0 pb-10">
                <DrawerHeader className="py-0 px-7 flex items-center justify-between">
                  <DrawerTitle className="text-left font-semibold text-md pt-5 pb-3">Property Filter</DrawerTitle>
                  <DrawerClose><X className="text-slate-500 w-4 h-4" /></DrawerClose>
                </DrawerHeader>

                <Separator orientation="horizontal" className="w-full drop-shadow-table bg-slate-100" />

                <div className="pt-4 px-7 space-y-7">
                  <TeamListTableFilter
                    header="필요세션"
                    filterValues={filterValues.필요세션}
                  />
                  <TeamListTableFilter
                    header="모집상태"
                    filterValues={filterValues.모집상태}
                  />
                </div>
              </DrawerContent>
            </Drawer>


            {/* 정렬 */}
            {/* TODO: 정렬 기능 구현 */}
            <MobileButton asChild variant="outline">
              <div className="h-9 w-9 drop-shadow-search">
                <ArrowDownUp
                  strokeWidth={1.75}
                  className="text-gray-400"
                  size={16}
                />
              </div>
            </MobileButton>
          </div>

          {/* 공연 선택 및 생성 버튼 */}
          <div className="grid grid-cols-2 gap-x-4">
            {/* 연관된 공연 목록 */}
            <RelatedPerformanceList
              currentPerformanceId={performanceId}
              relatedPerformances={relatedPerformances}
              className="drop-shadow-search"
            />

            {/* 생성 버튼 */}
            <Link
              href={ROUTES.PERFORMANCE.TEAM.CREATE(DEFAULT_PERFORMANCE_ID)}
              className="flex items-center gap-x-1"
            >
              <div className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white shadow w-full">
                <div className="relative h-4 w-4">
                  <div className="absolute left-0 top-0 h-4 w-4">
                    <Plus size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-sm font-medium leading-tight">
                    Create
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <Separator orientation="horizontal" className="my-3" />

        {/* 카드 목록 */}
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                <TeamCard
                  performanceId={performanceId}
                  id={row.original.id}
                  songName={row.original.songName}
                  songArtist={row.original.songArtist}
                  isFreshmenFixed={row.original.isFreshmenFixed}
                  isSelfMade={row.original.isSelfMade}
                  image={row.original.posterImage}
                  leader={row.original.leader}
                  memberSessions={missingMemberSessions(row.original.memberSessions ?? [])}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center">
              No results.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
