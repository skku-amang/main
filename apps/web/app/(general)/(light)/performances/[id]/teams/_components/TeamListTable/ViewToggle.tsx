import { LayoutGrid, Rows3 } from "lucide-react"

import { cn } from "@/lib/utils"

import { TeamListView } from "./useTeamListView"

const OPTIONS = [
  { value: "card", label: "카드", Icon: LayoutGrid },
  { value: "table", label: "표", Icon: Rows3 }
] as const

/** 데스크톱용: 카드 / 표 두 칸 */
export const ViewToggle = ({
  view,
  onChange
}: {
  view: TeamListView
  onChange: (view: TeamListView) => void
}) => (
  <div
    role="group"
    aria-label="보기 형식"
    className="flex h-10 rounded-full border border-gray-200 bg-white p-1"
  >
    {OPTIONS.map(({ value, label, Icon }) => (
      <button
        key={value}
        type="button"
        aria-pressed={view === value}
        onClick={() => onChange(value)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
          view === value
            ? "bg-primary text-white"
            : "text-slate-500 hover:text-primary"
        )}
      >
        <Icon className="size-4" />
        {label}
      </button>
    ))}
  </div>
)

/** 휴대폰용: 누르면 다른 보기로 바뀌는 버튼 하나 (상단 줄 자리가 좁음) */
export const ViewSwitchButton = ({
  view,
  onChange
}: {
  view: TeamListView
  onChange: (view: TeamListView) => void
}) => {
  const next = OPTIONS.find((o) => o.value !== view)!
  return (
    <button
      type="button"
      aria-label={`${next.label}로 보기`}
      onClick={() => onChange(next.value)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-slate-50 drop-shadow-search"
    >
      <next.Icon className="size-4 text-gray-400" strokeWidth={1.75} />
    </button>
  )
}
