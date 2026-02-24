"use client"

import type { CellContext } from "@tanstack/react-table"
import { ImagePlus, Loader2, Pencil } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { UserSelectContent } from "@/app/(admin)/_components/UserSelectContent"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useGetPresignedUrl } from "@/hooks/api/useUpload"
import { useUsers } from "@/hooks/api/useUser"
import { cn } from "@/lib/utils"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@repo/shared-types"

import "./types"

// --- Utility ---

function toDatetimeLocal(date: Date | string): string {
  const d = new Date(date)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// --- Sub-editors ---

interface EditorProps {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  type?: string
  step?: number
}

function CellEditor({
  value,
  onChange,
  onSave,
  onCancel,
  isPending,
  inputRef,
  type = "text",
  step
}: EditorProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center px-2">
      <input
        ref={inputRef}
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onSave()
          }
          if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
          }
        }}
        disabled={isPending}
        className={cn(
          "h-full w-full rounded-sm bg-background px-2 text-sm outline-none",
          "ring-2 ring-ring",
          isPending && "opacity-50"
        )}
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}

// --- Select cell editor ---

function SelectCellEditor({
  value,
  options,
  onSelect,
  onCancel,
  isPending
}: {
  value: string
  options: { label: string; value: string }[]
  onSelect: (value: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center px-1">
      <Select
        defaultOpen
        value={value}
        onValueChange={onSelect}
        onOpenChange={(open) => {
          if (!open) onCancel()
        }}
        disabled={isPending}
      >
        <SelectTrigger className="h-7 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="absolute right-7 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}

// --- User select cell editor ---

function UserSelectCellEditor({
  value,
  onSelect,
  onCancel,
  isPending,
  allowNone
}: {
  value: string
  onSelect: (value: string) => void
  onCancel: () => void
  isPending: boolean
  allowNone?: boolean
}) {
  const { data: users } = useUsers()

  return (
    <div className="absolute inset-0 z-10 flex items-center px-1">
      <Select
        defaultOpen
        value={value}
        onValueChange={onSelect}
        onOpenChange={(open) => {
          if (!open) onCancel()
        }}
        disabled={isPending}
      >
        <SelectTrigger className="h-7 text-sm">
          <SelectValue />
        </SelectTrigger>
        <UserSelectContent users={users} allowNone={allowNone} />
      </Select>
      {isPending && (
        <Loader2 className="absolute right-7 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}

// --- Boolean toggle cell ---

function BooleanCellToggle({
  checked,
  rowId,
  columnId,
  updateCell
}: {
  checked: boolean
  rowId: number
  columnId: string
  updateCell: (rowId: number, columnId: string, value: unknown) => Promise<void>
}) {
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    if (isPending) return
    setIsPending(true)
    try {
      await updateCell(rowId, columnId, !checked)
    } catch {
      /* page-level handler shows toast */
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center">
      <Checkbox
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      {isPending && (
        <Loader2 className="ml-1.5 h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}

// --- Image cell editor ---

function ImageCellEditor({
  currentUrl,
  rowId,
  columnId,
  updateCell
}: {
  currentUrl: string | null
  rowId: number
  columnId: string
  updateCell: (rowId: number, columnId: string, value: unknown) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, setIsPending] = useState(false)
  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return
    if (file.size > MAX_FILE_SIZE) return

    setIsPending(true)
    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl([
        { filename: file.name, contentType: file.type }
      ])
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      })
      await updateCell(rowId, columnId, publicUrl)
    } catch {
      /* page-level handler shows toast */
    } finally {
      setIsPending(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div
      className="group/cell -mx-2 -my-2 flex cursor-pointer items-center gap-1.5 rounded px-2 py-2 hover:bg-muted/80"
      onClick={() => !isPending && inputRef.current?.click()}
    >
      {currentUrl ? (
        <img
          src={currentUrl}
          alt=""
          className="h-10 w-8 rounded object-cover"
        />
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <ImagePlus className="h-3 w-3 shrink-0 text-muted-foreground/0 transition-colors group-hover/cell:text-muted-foreground" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

// --- Main EditableCell ---

interface EditableCellProps<TData, TValue> {
  cellContext: CellContext<TData, TValue>
  displayValue: React.ReactNode
}

export function EditableCell<TData extends { id: number }, TValue>({
  cellContext,
  displayValue
}: EditableCellProps<TData, TValue>) {
  const { table, row, column } = cellContext
  const meta = table.options.meta
  const columnMeta = column.columnDef.meta

  // Not editable — render display value only
  if (!columnMeta?.editable || !meta?.updateCell) {
    return <>{displayValue}</>
  }

  const editable = columnMeta.editable

  // Boolean — direct toggle, no edit mode needed
  if (editable.type === "boolean") {
    return (
      <BooleanCellToggle
        checked={!!row.getValue(column.id)}
        rowId={row.original.id}
        columnId={column.id}
        updateCell={meta.updateCell}
      />
    )
  }

  // Image — direct file pick + upload, no edit mode needed
  if (editable.type === "image") {
    return (
      <ImageCellEditor
        currentUrl={(row.getValue(column.id) as string) ?? null}
        rowId={row.original.id}
        columnId={column.id}
        updateCell={meta.updateCell}
      />
    )
  }

  const cellId = `${row.original.id}-${column.id}`
  const isEditing = meta.editingCell === cellId

  return (
    <EditableCellInner
      key={cellId}
      cellId={cellId}
      isEditing={isEditing}
      editable={editable}
      rawValue={row.getValue(column.id)}
      rowId={row.original.id}
      columnId={column.id}
      updateCell={meta.updateCell}
      setEditingCell={meta.setEditingCell}
      displayValue={displayValue}
    />
  )
}

// Inner component to use hooks unconditionally
function EditableCellInner({
  cellId,
  isEditing,
  editable,
  rawValue,
  rowId,
  columnId,
  updateCell,
  setEditingCell,
  displayValue
}: {
  cellId: string
  isEditing: boolean
  editable: NonNullable<
    NonNullable<
      import("@tanstack/react-table").ColumnMeta<unknown, unknown>
    >["editable"]
  >
  rawValue: unknown
  rowId: number
  columnId: string
  updateCell: (rowId: number, columnId: string, value: unknown) => Promise<void>
  setEditingCell: (cellId: string | null) => void
  displayValue: React.ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [editValue, setEditValue] = useState("")
  const savingRef = useRef(false)

  // Initialize edit value when entering edit mode
  useEffect(() => {
    if (isEditing) {
      let initial = ""
      if (editable.type === "number" && editable.displayTransform) {
        initial = editable.displayTransform(rawValue as number)
      } else if (editable.type === "date" && rawValue) {
        initial = toDatetimeLocal(rawValue as string | Date)
      } else {
        initial = rawValue != null ? String(rawValue) : ""
      }
      setEditValue(initial)
      savingRef.current = false

      // Focus after state update
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing, rawValue, editable])

  const handleSave = async () => {
    if (savingRef.current || !isEditing) return
    savingRef.current = true

    // Compute save value
    let saveValue: unknown = editValue
    if (editable.type === "number") {
      const num = parseFloat(editValue)
      if (isNaN(num)) {
        setEditingCell(null)
        return
      }
      saveValue = editable.saveTransform ? editable.saveTransform(num) : num
    } else if (editable.type === "date") {
      saveValue = editValue || null
    }

    // Check if value actually changed
    let originalForCompare: unknown = rawValue
    if (editable.type === "number" && editable.displayTransform) {
      originalForCompare = editable.displayTransform(rawValue as number)
    } else if (editable.type === "date" && rawValue) {
      originalForCompare = toDatetimeLocal(rawValue as string | Date)
    } else {
      originalForCompare = rawValue != null ? String(rawValue) : ""
    }

    if (String(editValue) === String(originalForCompare)) {
      setEditingCell(null)
      return
    }

    setIsPending(true)
    try {
      await updateCell(rowId, columnId, saveValue)
      setEditingCell(null)
    } catch {
      // Page-level handler already showed toast; revert UI
      setEditingCell(null)
    } finally {
      setIsPending(false)
    }
  }

  const handleSelectSave = async (newValue: string) => {
    if (savingRef.current || !isEditing) return
    savingRef.current = true

    if (newValue === String(rawValue ?? "")) {
      setEditingCell(null)
      return
    }

    setIsPending(true)
    try {
      await updateCell(rowId, columnId, newValue)
      setEditingCell(null)
    } catch {
      setEditingCell(null)
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    savingRef.current = true
    setEditingCell(null)
  }

  if (!isEditing) {
    return (
      <div
        className="group/cell -mx-2 -my-2 flex cursor-pointer items-center rounded px-2 py-2 hover:bg-muted/80"
        onClick={() => setEditingCell(cellId)}
      >
        <span className="flex-1 truncate">
          {displayValue || <span className="text-muted-foreground">-</span>}
        </span>
        <Pencil className="ml-1 h-3 w-3 shrink-0 text-muted-foreground/0 transition-colors group-hover/cell:text-muted-foreground" />
      </div>
    )
  }

  if (editable.type === "select") {
    return (
      <SelectCellEditor
        value={String(rawValue ?? "")}
        options={editable.options ?? []}
        onSelect={handleSelectSave}
        onCancel={handleCancel}
        isPending={isPending}
      />
    )
  }

  if (editable.type === "user") {
    return (
      <UserSelectCellEditor
        value={String(rawValue ?? "none")}
        onSelect={handleSelectSave}
        onCancel={handleCancel}
        isPending={isPending}
        allowNone
      />
    )
  }

  return (
    <CellEditor
      value={editValue}
      onChange={setEditValue}
      onSave={handleSave}
      onCancel={handleCancel}
      isPending={isPending}
      inputRef={inputRef}
      type={
        editable.type === "number"
          ? "number"
          : editable.type === "date"
            ? "datetime-local"
            : "text"
      }
      step={editable.type === "number" ? editable.step : undefined}
    />
  )
}
