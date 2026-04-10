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
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-3">
          <h3 className="text-xl font-bold">Filter</h3>
          <button
            onClick={onReset}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            초기화
          </button>
        </div>
        <button onClick={onClose}>
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-5 px-6 py-5">{children}</div>
    </>
  )
}
