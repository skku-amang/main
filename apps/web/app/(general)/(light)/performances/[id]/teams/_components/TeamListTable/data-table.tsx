"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from "@tanstack/react-table"
import { ArrowDownUp, CirclePlus, Filter, Plus, X } from "lucide-react"
import Link from "next/link"
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState
} from "nuqs"
import { useCallback, useEffect, useMemo, useState } from "react"

import TeamHeaderButton from "@/app/(general)/(light)/performances/[id]/teams/_components/Mobile/HeaderButton"
import TeamCard from "@/app/(general)/(light)/performances/[id]/teams/_components/Mobile/TeamCard"
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
import { FilterPopoverContent } from "@/components/FilterPopover"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ResponsivePagination } from "@/components/ui/responsive-pagination"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"
import {
  getSessionDisplayName,
  SESSION_DISPLAY_NAME
} from "@/constants/session"
import { useTeamBookmarks } from "@/hooks/api/useTeamBookmark"
import { useAuth } from "@/lib/providers/auth-provider"
import { getRosterSlots } from "@/lib/team/roster"
import {
  getSessionsWithMissingMembers,
  isTeamSatisfied,
  TeamFromList
} from "@/lib/team/teamSession"
import { isPerformanceRecruiting, Performance } from "@repo/shared-types"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "../Mobile/SortSelect"
import CompactTeamList from "./CompactTeamList"
import LoadMoreSentinel from "./LoadMoreSentinel"
import RosterCell from "./RosterCell"
import { TeamColumn } from "./columns"
import { TeamListView, useTeamListView } from "./useTeamListView"
import { ViewSwitchButton, ViewToggle } from "./ViewToggle"
import { useViewTip, ViewTip } from "./ViewTip"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "./drawer"

const SESSION_LABELS = Object.values(SESSION_DISPLAY_NAME)
const TEAMS_PER_PAGE = 10

interface DataTableProps<TValue> {
  className?: string
  columns: ColumnDef<TeamColumn, TValue>[]
  data: TeamFromList[]
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
  const { isAuthenticated, user } = useAuth()
  const currentPerformance = relatedPerformances.find(
    (p) => p.id === performanceId
  )
  const isRecruiting =
    !currentPerformance || isPerformanceRecruiting(currentPerformance)
  // 세션 자리별로 누가 맡았는지 — '필요세션' 열 자리에 세션 자리 열들을 넣는다
  const rosterSlots = useMemo(() => getRosterSlots(data), [data])
  const visibleColumns = useMemo(() => {
    const rosterColumns: ColumnDef<TeamColumn, TValue>[] = rosterSlots.map(
      (slot) => ({
        id: `slot-${slot.sessionName}-${slot.index}`,
        header: () => <div className="whitespace-nowrap">{slot.label}</div>,
        cell: ({ row }) => (
          <RosterCell
            team={row.original}
            slot={slot}
            canApply={isAuthenticated && isRecruiting}
            viewerId={user?.id}
          />
        )
      })
    )
    return columns
      .filter((c) => isAuthenticated || c.id !== "actions")
      .flatMap((c) => (c.id === "requiredSessions" ? rosterColumns : [c]))
  }, [isAuthenticated, isRecruiting, user?.id, columns, rosterSlots])
  const bookmarks = useTeamBookmarks()
  const rows: TeamColumn[] = useMemo(
    () => data.map((t) => ({ ...t, isBookmarked: bookmarks.has(t.id) })),
    [data, bookmarks]
  )
  // nuqs 쿼리 동기화
  const [sortQuery, setSortQuery] = useQueryState(
    "sort",
    parseAsString.withDefault("status-asc")
  )
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )
  const [pageQuery, setPageQuery] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" })
  )
  const resetPage = useCallback(
    () => setPageQuery(null, { history: "replace" }),
    [setPageQuery]
  )
  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: Math.max(0, pageQuery - 1), pageSize: TEAMS_PER_PAGE }),
    [pageQuery]
  )

  // sort query → tanstack SortingState 변환
  const sorting: SortingState = useMemo(() => {
    if (!sortQuery) return []
    const [id, dir] = sortQuery.split("-")
    if (!id || !dir) return []
    return [{ id, desc: dir === "desc" }]
  }, [sortQuery])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    searchQuery ? [{ id: "songName", value: searchQuery }] : []
  )

  const [filterOpen, setFilterOpen] = useState(false)
  const [sessionFilterArr, setSessionFilterArr] = useQueryState(
    "sessions",
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(["all", "active", "inactive"] as const).withDefault(
      "all"
    )
  )
  const [bookmarkedOnly, setBookmarkedOnly] = useQueryState(
    "bookmarked",
    parseAsBoolean.withDefault(false)
  )

  const sessionFilter = useMemo(
    () => new Set(sessionFilterArr),
    [sessionFilterArr]
  )

  const setSessionFilter = useCallback(
    (value: Set<string>) => {
      const arr = [...value]
      setSessionFilterArr(arr.length > 0 ? arr : null)
      resetPage()
    },
    [setSessionFilterArr, resetPage]
  )

  const toggleSession = useCallback(
    (session: string, checked: boolean) => {
      setSessionFilterArr((prev) => {
        const arr = prev ?? []
        if (checked) return [...arr, session]
        const next = arr.filter((s) => s !== session)
        return next.length > 0 ? next : null
      })
      resetPage()
    },
    [setSessionFilterArr, resetPage]
  )

  const resetFilters = useCallback(() => {
    setSessionFilterArr(null)
    setStatusFilter("all")
    setBookmarkedOnly(null)
    resetPage()
  }, [setSessionFilterArr, setStatusFilter, setBookmarkedOnly, resetPage])

  const changeStatusFilter = useCallback(
    (value: "all" | "active" | "inactive") => {
      setStatusFilter(value)
      resetPage()
    },
    [setStatusFilter, resetPage]
  )

  const filteredData = useMemo(() => {
    if (sessionFilter.size === 0 && statusFilter === "all" && !bookmarkedOnly)
      return rows

    return rows.filter((team) => {
      if (!team.teamSessions) return false
      if (bookmarkedOnly && !team.isBookmarked) return false

      if (statusFilter === "active" && isTeamSatisfied(team.teamSessions))
        return false
      if (statusFilter === "inactive" && !isTeamSatisfied(team.teamSessions))
        return false

      if (sessionFilter.size > 0) {
        const hasMatchingSession = getSessionsWithMissingMembers(
          team.teamSessions
        ).some((ts) =>
          sessionFilter.has(getSessionDisplayName(ts.session.name))
        )
        if (!hasMatchingSession) return false
      }

      return true
    })
  }, [rows, sessionFilter, statusFilter, bookmarkedOnly])

  const filterValues: {
    필요세션: FilterValue[]
    모집상태: FilterValue[]
    별표: FilterValue[]
  } = {
    필요세션: [
      ...SESSION_LABELS.map((label) => ({
        label,
        onChecked: (checked: boolean) => toggleSession(label, checked),
        checked: sessionFilter.has(label)
      }))
    ],
    모집상태: [
      {
        label: "Active",
        onChecked: (checked: boolean) =>
          changeStatusFilter(checked ? "active" : "all"),
        checked: statusFilter === "active"
      },
      {
        label: "Inactive",
        onChecked: (checked: boolean) =>
          changeStatusFilter(checked ? "inactive" : "all"),
        checked: statusFilter === "inactive"
      }
    ],
    별표: [
      {
        label: "별표한 팀만",
        onChecked: (checked: boolean) => {
          setBookmarkedOnly(checked || null)
          resetPage()
        },
        checked: bookmarkedOnly
      }
    ]
  }

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      const first = next[0]
      resetPage()
      if (!first) {
        setSortQuery(null)
      } else {
        setSortQuery(`${first.id}-${first.desc ? "desc" : "asc"}`)
      }
    },
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      setPageQuery(next.pageIndex + 1)
    },
    autoResetPageIndex: false,
    state: {
      sorting,
      pagination,
      columnFilters,
      // 별표 열은 빼지 않고 숨김 — 로그인 확인 전에도 sort=bookmark-* 정렬 대상이 있어야 함
      columnVisibility: { createdAt: false, bookmark: isAuthenticated }
    }
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    if (pageCount > 0 && pageQuery > pageCount) {
      setPageQuery(pageCount, { history: "replace" })
    }
  }, [pageCount, pageQuery, setPageQuery])

  // 휴대폰 표 보기는 페이지 대신 아래로 내릴 때마다 더 보여 준다. 필터·정렬·검색이 바뀌면 처음 개수로
  const allRows = table.getPrePaginationRowModel().rows
  const shownResetKey = JSON.stringify([
    sortQuery,
    searchQuery,
    sessionFilterArr,
    statusFilter,
    bookmarkedOnly
  ])
  const [shown, setShown] = useState({
    key: shownResetKey,
    count: TEAMS_PER_PAGE
  })
  const shownCount = Math.min(
    shown.key === shownResetKey ? shown.count : TEAMS_PER_PAGE,
    allRows.length
  )
  const showMore = useCallback(
    () => setShown({ key: shownResetKey, count: shownCount + TEAMS_PER_PAGE }),
    [shownResetKey, shownCount]
  )

  const missingMemberSessions = getSessionsWithMissingMembers

  const sortOptions = [
    { value: "songName-asc", display: "곡명 오름차순" },
    { value: "songName-desc", display: "곡명 내림차순" },
    { value: "createdAt-desc", display: "최신순" },
    { value: "createdAt-asc", display: "오래된순" },
    { value: "status-asc", display: "모집중 우선" },
    { value: "status-desc", display: "모집완료 우선" },
    ...(isAuthenticated
      ? [{ value: "bookmark-desc", display: "별표 우선" }]
      : [])
  ]

  const [view, setView] = useTeamListView()
  const listView = view ?? "table"
  const [showViewTip, dismissViewTip] = useViewTip()
  const changeView = (next: TeamListView) => {
    setView(next)
    dismissViewTip()
  }

  const rowsOnPage = table.getRowModel().rows
  const emptyMessage = (
    <div className="flex flex-col items-center justify-center py-10 font-semibold text-gray-400">
      생성된 공연팀이 존재하지 않습니다
    </div>
  )
  const teamCards = rowsOnPage.map((row) => (
    <TeamCard
      key={row.id}
      performanceId={performanceId}
      id={row.original.id}
      songName={row.original.songName}
      songArtist={row.original.songArtist}
      isFreshmenFixed={row.original.isFreshmenFixed}
      isSelfMade={row.original.isSelfMade}
      isBookmarked={row.original.isBookmarked}
      image={row.original.image}
      leader={row.original.leader}
      missingTeamSessions={missingMemberSessions(row.original.teamSessions)}
    />
  ))

  return (
    <div className={className}>
      {/* 데스크톱 */}
      <div className="hidden md:block">
        {/* 헤더 */}
        <div className="flex items-center justify-between py-[25px]">
          {/* 검색 */}
          <Search
            placeholder="곡명, 이름 검색"
            value={searchQuery}
            onChange={(event) => {
              const value = event.target.value
              setSearchQuery(value || null)
              resetPage()
              table.getColumn("songName")?.setFilterValue(value)
            }}
            className="max-w-sm"
          />

          {/* 보기 형식, 생성, 필터 */}
          <div className="flex gap-4">
            <ViewToggle view={listView} onChange={changeView} />

            {/* 생성 버튼 */}
            {isRecruiting ? (
              <Button
                asChild
                className="h-10 w-[136px] rounded-full text-[20px] font-semibold"
              >
                <Link href={ROUTES.PERFORMANCE.TEAM.CREATE(performanceId)}>
                  <CirclePlus size={24} className="me-[9px]" />
                  Create
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                className="h-10 w-[136px] rounded-full text-[20px] font-semibold"
              >
                모집 마감
              </Button>
            )}

            {/* 필터 */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger>
                <Button
                  asChild
                  className="h-10 w-[136px] rounded-full text-[20px] font-semibold"
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
                className="w-[526px] rounded-[12px] p-0"
              >
                <FilterPopoverContent
                  onReset={resetFilters}
                  onClose={() => setFilterOpen(false)}
                >
                  <TeamListTableFilter
                    header="필요세션"
                    filterValues={filterValues.필요세션}
                    onSelectAll={() => setSessionFilter(new Set())}
                  />
                  <Separator />
                  <TeamListTableFilter
                    header="모집상태"
                    filterValues={filterValues.모집상태}
                    onSelectAll={() => changeStatusFilter("all")}
                  />
                  {isAuthenticated && (
                    <>
                      <Separator />
                      <TeamListTableFilter
                        header="별표"
                        filterValues={filterValues.별표}
                      />
                    </>
                  )}
                </FilterPopoverContent>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {listView === "card" ? (
          rowsOnPage.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {teamCards}
            </div>
          ) : (
            emptyMessage
          )
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="border-y border-gray-200 bg-gray-100 py-0 font-semibold text-neutral-600 first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r"
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
                    className="bg-white drop-shadow-[0_1px_2px_rgb(0,0,0,0.06)] transition-all duration-300 hover:drop-shadow-[2px_2px_4px_rgb(0,0,0,0.06)]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="bg-transparent first:rounded-l-lg last:rounded-r-lg"
                      >
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
        )}

        {/* 페이지네이션 */}
        {table.getRowModel().rows.length > 0 && (
          <div className="pb-6 pt-14">
            <ResponsivePagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
            />
          </div>
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden">
        {/* 헤더 */}
        <div className="space-y-3">
          {/* 검색, 필터, 정렬 */}
          <div className="flex items-center gap-x-3">
            {/* 검색 */}
            <Search
              placeholder="곡명, 이름 검색"
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value
                setSearchQuery(value || null)
                resetPage()
                table.getColumn("songName")?.setFilterValue(value)
              }}
              className="h-9 min-w-0 flex-1 border-gray-200 drop-shadow-search"
            />

            {/* 필터 */}
            <Drawer>
              <DrawerTrigger aria-label="필터">
                <TeamHeaderButton asChild variant="outline">
                  <Filter
                    className={
                      sessionFilter.size > 0 ||
                      statusFilter !== "all" ||
                      bookmarkedOnly
                        ? "text-primary"
                        : "text-gray-400"
                    }
                    size={16}
                  />
                </TeamHeaderButton>
              </DrawerTrigger>
              <DrawerContent className="px-0 pb-[env(safe-area-inset-bottom)]">
                <DrawerHeader className="flex shrink-0 items-center justify-between px-7 py-0">
                  <DrawerTitle className="mb-3 mt-5 flex h-5 items-baseline gap-x-[15px] ">
                    <div className="h-full text-left text-[14px] font-semibold">
                      Property Filter
                    </div>
                    <button
                      className="h-full text-[10px] font-normal text-third"
                      onClick={resetFilters}
                    >
                      초기화
                    </button>
                  </DrawerTitle>
                  <DrawerClose aria-label="닫기">
                    <X className="h-3 w-3 text-slate-500" strokeWidth={2} />
                  </DrawerClose>
                </DrawerHeader>

                <Separator
                  orientation="horizontal"
                  className="w-full bg-slate-100 drop-shadow-table"
                />

                <div className="space-y-7 px-7 pt-4 pb-6">
                  <TeamListTableFilter
                    header="필요세션"
                    filterValues={filterValues.필요세션}
                  />
                  <TeamListTableFilter
                    header="모집상태"
                    filterValues={filterValues.모집상태}
                  />
                  {isAuthenticated && (
                    <TeamListTableFilter
                      header="별표"
                      filterValues={filterValues.별표}
                    />
                  )}
                </div>
              </DrawerContent>
            </Drawer>

            {/* 정렬 */}
            <Select
              value={sortQuery || "none"}
              onValueChange={(value) => {
                setSortQuery(value === "none" ? null : value)
                resetPage()
              }}
            >
              <SelectTrigger aria-label="정렬">
                <TeamHeaderButton asChild variant="outline">
                  <ArrowDownUp
                    strokeWidth={1.75}
                    className={sortQuery ? "text-primary" : "text-gray-400"}
                    size={16}
                  />
                </TeamHeaderButton>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.display}
                  </SelectItem>
                ))}
                <SelectItem value="none">정렬해제</SelectItem>
              </SelectContent>
            </Select>

            {/* 보기 형식 */}
            <ViewTip show={showViewTip} onDismiss={dismissViewTip}>
              <ViewSwitchButton view={listView} onChange={changeView} />
            </ViewTip>

            {/* 생성 버튼 */}
            {isRecruiting ? (
              <Link
                href={ROUTES.PERFORMANCE.TEAM.CREATE(performanceId)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow"
              >
                <Plus size={16} />
                Create
              </Link>
            ) : (
              <div className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-muted px-3 text-sm font-medium text-muted-foreground">
                모집 마감
              </div>
            )}
          </div>
        </div>

        <Separator orientation="horizontal" className="my-3" />

        {/* 팀 목록 */}
        {listView === "card" ? (
          rowsOnPage.length ? (
            <div className="space-y-3">{teamCards}</div>
          ) : (
            emptyMessage
          )
        ) : allRows.length ? (
          <>
            <CompactTeamList
              rows={allRows.slice(0, shownCount)}
              slots={rosterSlots}
              viewerId={user?.id}
              canApply={isAuthenticated && isRecruiting}
            />
            {shownCount < allRows.length && (
              <LoadMoreSentinel onVisible={showMore} />
            )}
            <p className="py-6 text-center text-xs text-slate-500">
              {allRows.length}개 중 {shownCount}개 표시
            </p>
          </>
        ) : (
          emptyMessage
        )}

        {/* 모바일 페이지네이션 */}
        {listView === "card" && rowsOnPage.length > 0 && (
          <div className="py-6">
            <ResponsivePagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
