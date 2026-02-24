import type { RowData } from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateCell?: (
      rowId: number,
      columnId: string,
      value: unknown
    ) => Promise<void>
    editingCell: string | null
    setEditingCell: (cellId: string | null) => void
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    editable?: {
      type: "text" | "number" | "date" | "select" | "boolean"
      step?: number
      displayTransform?: (v: number) => string
      saveTransform?: (v: number) => number
      options?: { label: string; value: string }[]
    }
  }
}
