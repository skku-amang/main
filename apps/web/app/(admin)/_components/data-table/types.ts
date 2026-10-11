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
    // Include this column in CSV export even when hidden from the table.
    alwaysExport?: boolean
    editable?: {
      type:
        | "text"
        | "number"
        | "date"
        | "select"
        | "boolean"
        | "image"
        | "user"
        | "generation"
      step?: number
      displayTransform?: (v: number) => string
      saveTransform?: (v: number) => number
      options?: { label: string; value: string; disabled?: boolean }[]
      // 편집 값이 표시·정렬·검색·CSV용 accessor 값과 다를 때 (예: 이름 표시, id 편집)
      getValue?: (row: TData) => unknown
    }
  }
}
