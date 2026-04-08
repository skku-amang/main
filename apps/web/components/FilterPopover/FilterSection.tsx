"use client"

import { Label } from "@/components/ui/label"

import FilterCheckbox from "./FilterCheckbox"

export interface FilterItem {
  label: string
  checked?: boolean
  onCheckedChange: (checked: boolean) => void
}

interface FilterSectionProps {
  className?: string
  header: string
  items: FilterItem[]
  onSelectAll?: () => void
  /** Grid columns (default: 5 for desktop, override for mobile) */
  columns?: 3 | 4 | 5
}

const gridColsClass = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5"
} as const

export default function FilterSection({
  className,
  header,
  items,
  onSelectAll,
  columns = 5
}: FilterSectionProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center gap-x-3">
        <div className="text-sm font-semibold text-neutral-700">{header}</div>
        {onSelectAll && (
          <button
            onClick={onSelectAll}
            className="text-xs text-sky-500 hover:text-sky-600"
          >
            모두 선택
          </button>
        )}
      </div>

      <div className={`grid ${gridColsClass[columns]} gap-x-5 gap-y-3`}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-x-2">
            <FilterCheckbox
              id={`filter-${header}-${item.label}`}
              name={item.label}
              value={item.label}
              checked={item.checked}
              onCheckedChange={(checked) => item.onCheckedChange(!!checked)}
            />
            <Label
              htmlFor={`filter-${header}-${item.label}`}
              className="text-nowrap text-sm text-gray-900"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
