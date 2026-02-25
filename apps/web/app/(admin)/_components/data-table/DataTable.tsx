"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext
} from "@dnd-kit/sortable"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table"
import { usePathname } from "next/navigation"
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates
} from "nuqs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import { DataTablePagination } from "./DataTablePagination"
import { DataTableToolbar, type FilterConfig } from "./DataTableToolbar"
import { DraggableHeader } from "./DraggableHeader"
import "./types"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  searchColumn?: string
  searchPlaceholder?: string
  onCreateClick?: () => void
  createLabel?: string
  emptyMessage?: string
  initialSorting?: SortingState
  onUpdateCell?: (
    rowId: number,
    columnId: string,
    value: unknown
  ) => Promise<void>
  filters?: FilterConfig[]
  initialColumnVisibility?: VisibilityState
  onBulkDelete?: (rows: TData[]) => void
  enableGlobalSearch?: boolean
}

/**
 * Thin shell that defers mount of DataTableInner until after hydration.
 * nuqs hooks inside DataTableInner do async state sync during SSR hydration,
 * triggering "Can't perform a React state update on a component that hasn't
 * mounted yet". By rendering a skeleton on the server/first client render and
 * only mounting the real table after useEffect fires, all nuqs hooks run in a
 * pure client context where the URL is already available.
 */
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {props.columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return <DataTableInner {...props} />
}

function DataTableInner<TData, TValue>({
  columns: userColumns,
  data,
  isLoading = false,
  searchColumn,
  searchPlaceholder,
  onCreateClick,
  createLabel,
  emptyMessage = "데이터가 없습니다.",
  initialSorting = [],
  onUpdateCell,
  filters = [],
  initialColumnVisibility = {},
  onBulkDelete,
  enableGlobalSearch = false
}: DataTableProps<TData, TValue>) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Inject select checkbox column when bulk delete is enabled
  const hasBulkDelete = !!onBulkDelete
  const columns = useMemo(() => {
    if (!hasBulkDelete) return userColumns

    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="행 선택"
        />
      ),
      size: 32,
      enableSorting: false,
      enableHiding: false
    }

    return [selectColumn, ...userColumns]
  }, [userColumns, hasBulkDelete])

  // Column visibility — persisted in localStorage per page
  const pathname = usePathname()
  const visibilityStorageKey = `data-table-visibility:${pathname}`
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem(visibilityStorageKey)
      if (stored) setColumnVisibility(JSON.parse(stored))
    } catch {
      /* ignore */
    }
  }, [visibilityStorageKey])

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback(
    (updaterOrValue) => {
      setColumnVisibility((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue
        try {
          localStorage.setItem(visibilityStorageKey, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [visibilityStorageKey]
  )

  // URL-synced sorting state
  const defaultSort = initialSorting[0]
  const [sortId, setSortId] = useQueryState(
    "sort",
    parseAsString
      .withDefault(defaultSort?.id ?? "")
      .withOptions({ history: "replace" })
  )
  const [sortOrder, setSortOrder] = useQueryState(
    "order",
    parseAsString
      .withDefault(defaultSort?.desc ? "desc" : "asc")
      .withOptions({ history: "replace" })
  )

  const sorting: SortingState = useMemo(
    () => (sortId ? [{ id: sortId, desc: sortOrder === "desc" }] : []),
    [sortId, sortOrder]
  )

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue
      const first = next[0]
      if (first) {
        setSortId(first.id)
        setSortOrder(first.desc ? "desc" : "asc")
      } else {
        setSortId(null)
        setSortOrder(null)
      }
    },
    [sorting, setSortId, setSortOrder]
  )

  // URL-synced filter state via nuqs
  const filterParsers = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.columnId, parseAsString])),
    [filters]
  )

  const [urlFilters, setUrlFilters] = useQueryStates(filterParsers, {
    history: "replace"
  })

  // Local search state (not in URL)
  const [searchValue, setSearchValue] = useState("")

  // Derive combined ColumnFiltersState for TanStack Table
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const result: ColumnFiltersState = []

    if (searchColumn && searchValue) {
      result.push({ id: searchColumn, value: searchValue })
    }

    for (const [id, value] of Object.entries(urlFilters)) {
      if (value != null) {
        result.push({ id, value })
      }
    }

    return result
  }, [searchColumn, searchValue, urlFilters])

  // Route filter changes to the right state store
  const filterColumnIds = useMemo(
    () => new Set(filters.map((f) => f.columnId)),
    [filters]
  )

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue

      // Update search
      if (searchColumn) {
        const match = next.find((f) => f.id === searchColumn)
        setSearchValue(match ? String(match.value) : "")
      }

      // Update URL filters
      const urlUpdate: Record<string, string | null> = {}
      for (const columnId of filterColumnIds) {
        const match = next.find((f) => f.id === columnId)
        urlUpdate[columnId] = match ? String(match.value) : null
      }
      setUrlFilters(urlUpdate)
    },
    [columnFilters, searchColumn, filterColumnIds, setUrlFilters]
  )

  // URL-synced highlighted row
  const [highlightedRowId] = useQueryState(
    "rowId",
    parseAsInteger.withOptions({ history: "replace" })
  )
  const highlightRef = useRef<HTMLTableRowElement>(null)

  // Column pinning: id left, actions right
  const [columnPinning] = useState<ColumnPinningState>({
    left: ["select", "id"],
    right: ["actions"]
  })

  // Column order for drag reorder — lazy init from column defs
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    columns.map((c) => {
      if ("id" in c && c.id) return c.id
      if ("accessorKey" in c && typeof c.accessorKey === "string")
        return c.accessorKey
      return ""
    })
  )

  // DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string)
        const newIndex = prev.indexOf(over.id as string)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      rowSelection,
      globalFilter,
      columnPinning
    },
    meta: {
      updateCell: onUpdateCell,
      editingCell,
      setEditingCell
    }
  })

  // Keep a ref to table so effects don't re-fire on every render
  const tableRef = useRef(table)
  tableRef.current = table

  // Navigate to the page containing the highlighted row
  useEffect(() => {
    if (highlightedRowId == null) return
    const t = tableRef.current
    const allRows = t.getFilteredRowModel().rows
    const rowIndex = allRows.findIndex(
      (r) => (r.original as { id?: number }).id === highlightedRowId
    )
    if (rowIndex < 0) return

    const pageSize = t.getState().pagination.pageSize
    const targetPage = Math.floor(rowIndex / pageSize)
    if (t.getState().pagination.pageIndex !== targetPage) {
      t.setPageIndex(targetPage)
    }
  }, [highlightedRowId])

  // Scroll highlighted row into view
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
    }
  }, [highlightedRowId])

  // Search handler for toolbar — routes to column filter or global filter
  const handleSearchChange = useCallback(
    (value: string) => {
      if (enableGlobalSearch) {
        setGlobalFilter(value)
      } else if (searchColumn) {
        table.getColumn(searchColumn)?.setFilterValue(value || undefined)
      }
    },
    [enableGlobalSearch, searchColumn, table]
  )

  const searchDisplayValue = enableGlobalSearch
    ? globalFilter
    : searchColumn
      ? ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "")
      : ""

  return (
    <div>
      <DataTableToolbar
        table={table}
        searchValue={searchDisplayValue}
        onSearchChange={
          searchColumn || enableGlobalSearch ? handleSearchChange : undefined
        }
        searchPlaceholder={searchPlaceholder}
        onCreateClick={onCreateClick}
        createLabel={createLabel}
        filters={filters}
        onBulkDelete={
          onBulkDelete
            ? () => {
                const selected = table
                  .getFilteredSelectedRowModel()
                  .rows.map((r) => r.original)
                onBulkDelete(selected)
                setRowSelection({})
              }
            : undefined
        }
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
      />

      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto rounded-md border">
          <Table style={{ minWidth: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isHighlighted =
                    highlightedRowId != null &&
                    (row.original as { id?: number }).id === highlightedRowId

                  return (
                    <TableRow
                      key={row.id}
                      ref={isHighlighted ? highlightRef : undefined}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        isHighlighted &&
                          "bg-primary/5 ring-1 ring-inset ring-primary/20"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="relative"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-neutral-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {table.getFilteredRowModel().rows.length > 0 && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}
