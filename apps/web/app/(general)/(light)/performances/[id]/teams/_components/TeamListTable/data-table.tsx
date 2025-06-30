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

import TeamHeaderButton from "@/app/(general)/(light)/performances/[id]/teams/_components/Mobile/HeaderButton"
import TeamCard from "@/app/(general)/(light)/performances/[id]/teams/_components/Mobile/TeamCard"
import RelatedPerformanceList from "@/app/(general)/(light)/performances/[id]/teams/_components/RelatedPerformanceList"
import TeamListTableFilter, {
  FilterValue
} from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/filter"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/table"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import { Performance } from "@/types/Performance"
import { MemberSession, MemberSessionSet } from "@/types/Team"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "../Mobile/SortSelect"
import { TeamColumn } from "./columns"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
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
  className?: string
  columns: ColumnDef<TeamColumn, TValue>[]
  data: TeamColumn[]
  relatedPerformances: Performance[]
  performanceId: number
}

export function TeamListDataTable<TValue>({
  className,
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

  const sortOptions: {
    id: keyof TeamColumn
    display: string
    desc: boolean
  }[] = [
    { id: "songName", display: "곡명 오름차순", desc: false },
    { id: "songArtist", display: "곡명 내림차순", desc: true }
    // TODO: 최신순 추가
    // { id: "createdDatetime", display: "최신순", desc: true },
    // { id: "createdDatetime", display: "오래된순", desc: false },
  ]

  return (
    <div className={className}>
      {/* 데스크톱: 테이블 보기 */}
      <div className="hidden md:block">
        {/* 헤더 */}
        <div className="flex items-center justify-between py-[25px]">
          {/* 검색 */}
          <Search
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
          <div className="flex gap-4">
            {/* 생성 버튼 */}
            <Button
              asChild
              className="h-10 w-[136px] rounded-[6px] text-[20px] font-semibold"
            >
              <Link href={ROUTES.PERFORMANCE.TEAM.CREATE(performanceId)}>
                <CirclePlus size={24} className="me-[9px]" />
                Create
              </Link>
            </Button>

            {/* 필터 */}
            <Popover open={filterOpen}>
              <PopoverTrigger>
                <Button
                  asChild
                  className="h-10 w-[136px] rounded-[6px] text-[20px] font-semibold"
                  onClick={() => setFilterOpen(true)}
                  variant={filterOpen ? "outline" : undefined}
                >
                  <div>
                    <Filter size={24} className="me-[9px]" />
                    Filter
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                onInteractOutside={() => setFilterOpen(false)}
                className="flex gap-6 px-9 py-6 md:h-[256px] md:w-[400px]"
              >
                <TeamListTableFilter
                  header="필요세션"
                  filterValues={filterValues.필요세션}
                />
                <Separator orientation="vertical" className="h-[216px]" />
                <TeamListTableFilter
                  header="모집상태"
                  filterValues={filterValues.모집상태}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 테이블 */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-zinc-700 py-0 font-bold text-white"
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
                  className="bg-white drop-shadow-[0_1px_2px_rgb(0,0,0,0.06)] transition-all duration-300 hover:drop-shadow-[0_4px_4px_rgb(0,0,0,0.25)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="bg-transparent">
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
                  className="h-24 text-center font-semibold text-gray-400"
                >
                  생성된 공연팀이 존재하지 않습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {table.getRowModel().rows.length > 0 && (
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
        )}
      </div>

      {/* 모바일: 카드 보기 */}
      <div className="md:hidden">
        {/* 헤더 */}
        <div className="space-y-3">
          {/* 검색, 필터, 정렬 */}
          <div className="flex items-center justify-center gap-x-3">
            {/* 검색 */}
            <Search
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
                <TeamHeaderButton asChild variant="outline">
                  <Filter className="text-gray-400" size={16} />
                </TeamHeaderButton>
              </DrawerTrigger>
              <DrawerContent className="px-0 pb-10">
                <DrawerHeader className="flex items-center justify-between px-7 py-0">
                  <DrawerTitle className="mb-3 mt-5 flex h-5 items-baseline gap-x-[15px] ">
                    <div className="h-full text-left text-[14px] font-semibold">
                      Property Filter
                    </div>
                    {/* TODO: 초기화 기능 추가 */}
                    <button className="h-full text-[10px] font-normal text-third">
                      초기화
                    </button>
                  </DrawerTitle>
                  <DrawerClose>
                    <X className="h-3 w-3 text-slate-500" strokeWidth={2} />
                  </DrawerClose>
                </DrawerHeader>

                <Separator
                  orientation="horizontal"
                  className="w-full bg-slate-100 drop-shadow-table"
                />

                <div className="space-y-7 px-7 pt-4">
                  {/* TODO: 초기화 버튼 및 기능 추가 */}
                  <TeamListTableFilter
                    header="필요세션"
                    filterValues={filterValues.필요세션}
                  />
                  {/* TODO: 초기화 버튼 및 기능 추가 */}
                  <TeamListTableFilter
                    header="모집상태"
                    filterValues={filterValues.모집상태}
                  />
                </div>
              </DrawerContent>
            </Drawer>

            {/* 정렬 */}
            {/* TODO: 정렬 기능 구현 */}
            {/* Table과 완전 분리해서 정렬 로직 구성해야 함 */}
            <Select
              defaultValue={"null"}
              // value={sorting[0].id ?? "null"}
              // onValueChange={(value) => setSorting([value])}
            >
              <SelectTrigger>
                <TeamHeaderButton asChild variant="outline">
                  <ArrowDownUp
                    strokeWidth={1.75}
                    className="text-gray-400"
                    size={16}
                  />
                </TeamHeaderButton>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.display}
                  </SelectItem>
                ))}
                <SelectItem value="null" onSelect={() => setSorting([])}>
                  정렬해제
                </SelectItem>
              </SelectContent>
            </Select>
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
              <div className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white shadow">
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
                  memberSessions={missingMemberSessions(
                    row.original.memberSessions ?? []
                  )}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center">
              생성된 공연팀이 존재하지 않습니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
