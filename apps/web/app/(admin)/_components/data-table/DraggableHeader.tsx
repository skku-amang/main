"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Header, flexRender } from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { TableHead } from "@/components/ui/table"

interface DraggableHeaderProps<TData> {
  header: Header<TData, unknown>
}

export function DraggableHeader<TData>({
  header
}: DraggableHeaderProps<TData>) {
  const isPinned = header.column.getIsPinned()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: header.column.id,
    disabled: !!isPinned
  })

  const style: CSSProperties = {
    width: header.getSize(),
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative"
  }

  return (
    <TableHead ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center gap-1">
        {!isPinned && (
          <GripVertical
            className="h-3 w-3 shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          />
        )}
        <div className="flex-1">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
            "hover:bg-primary/50",
            header.column.getIsResizing() && "bg-primary"
          )}
        />
      )}
    </TableHead>
  )
}
