"use client"

import { X } from "lucide-react"

import { Separator } from "@/components/ui/separator"

interface FilterPopoverContentProps {
  onReset: () => void
  onClose: () => void
  children: React.ReactNode
}

export default function FilterPopoverContent({
  onReset,
  onClose,
  children
}: FilterPopoverContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <div className="flex items-baseline gap-x-3">
          <h3 className="text-xl font-bold">Filter</h3>
          <button
            onClick={onReset}
            className="text-xs text-sky-500 hover:text-sky-600"
          >
            초기화
          </button>
        </div>
        <button onClick={onClose}>
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-5 px-6 py-5">{children}</div>
    </>
  )
}
