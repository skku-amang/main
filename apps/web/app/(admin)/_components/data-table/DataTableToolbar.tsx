"use client"

import { Table } from "@tanstack/react-table"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  onCreateClick?: () => void
  createLabel?: string
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "검색...",
  onCreateClick,
  createLabel = "생성"
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      {searchColumn && (
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn(searchColumn)?.setFilterValue(e.target.value)
            }
            className="pl-9"
          />
        </div>
      )}
      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="mr-1 h-4 w-4" />
          {createLabel}
        </Button>
      )}
    </div>
  )
}
