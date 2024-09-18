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
import Link from "next/link"
import { useReducer, useState } from "react"
import { CiCirclePlus } from "react-icons/ci"
import { TbFilter } from "react-icons/tb"

import TeamListTableFilter, {
  FilterValue
} from "@/app/(general)/teams/_components/TeamListTable/filter"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/(general)/teams/_components/TeamListTable/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"
import { MemberSessionSet } from "@/types/Team"

import { TeamColumn } from "./columns"

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

  // TODO: 여기서 `action`을 참조하는 모든 코드는 지워야 함
  // 왜냐하면 action을 참조한다는 것은 이번에 한시적으로 추가/수정된 action의 내용만을 반영한다는 것임
  // 이전의 모든 필터를 적용시켜야 하기 때문에
  // action이 아니라 state.filters 만을 참조해야 함

  // 실제 데이터에 반영
  // 모두 선택시
  if (
    Object.values(newState.filters.필요세션).length === 0 &&
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
}

export function TeamListDataTable<TValue>({
  columns,
  data
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
      }
      // TODO: 백엔드 seed 스크립트 추가, types.ts에 추가 후 적용
      // { label: "현악기", onChecked: () => console.log() },
      // { label: "관악기", onChecked: () => console.log() }
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

  return (
    <div>
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
              <CiCirclePlus size={22} />
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
                  <TbFilter size={22} />
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
