"use client"

import { Table } from "@tanstack/react-table"
import { Download, Plus, Search, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./DataTableViewOptions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export interface FilterConfig {
  columnId: string
  label: string
  options: { label: string; value: string }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onCreateClick?: () => void
  createLabel?: string
  filters?: FilterConfig[]
  onBulkDelete?: () => void
  selectedCount?: number
}

function exportToCsv<TData>(table: Table<TData>) {
  const visibleColumns = table
    .getAllColumns()
    .filter(
      (col) => col.getIsVisible() && col.id !== "select" && col.id !== "actions"
    )

  const headers = visibleColumns.map(
    (col) => col.columnDef.meta?.label ?? col.id
  )

  const rows = table.getFilteredRowModel().rows.map((row) =>
    visibleColumns.map((col) => {
      const value = row.getValue(col.id)
      if (value == null) return ""
      const str = String(value)
      // Escape CSV values containing commas, quotes, or newlines
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  )

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `export-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "검색...",
  onCreateClick,
  createLabel = "생성",
  filters = [],
  onBulkDelete,
  selectedCount = 0
}: DataTableToolbarProps<TData>) {
  const hasActiveFilters = filters.some(
    (f) => table.getColumn(f.columnId)?.getFilterValue() != null
  )

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      {onSearchChange && (
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filters.map((filter) => {
        const column = table.getColumn(filter.columnId)
        if (!column) return null

        const currentValue = column.getFilterValue() as string | undefined

        return (
          <Select
            key={filter.columnId}
            value={currentValue ?? "__all__"}
            onValueChange={(v) =>
              column.setFilterValue(v === "__all__" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">전체 {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            filters.forEach((f) =>
              table.getColumn(f.columnId)?.setFilterValue(undefined)
            )
          }
        >
          초기화
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}

      {selectedCount > 0 && onBulkDelete && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          {selectedCount}개 삭제
        </Button>
      )}

      <div className="flex-1" />

      <Button variant="outline" size="sm" onClick={() => exportToCsv(table)}>
        <Download className="mr-1 h-4 w-4" />
        CSV
      </Button>

      <DataTableViewOptions table={table} />

      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="mr-1 h-4 w-4" />
          {createLabel}
        </Button>
      )}
    </div>
  )
}
