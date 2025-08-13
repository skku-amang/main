// MonthBlock.tsx
import { Dayjs } from "dayjs"

interface MonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  onSelect?(d: Dayjs): void
}

export default function MonthBlock({
  days,
  currentMonth,
  onSelect
}: MonthBlockProps) {
  return (
    <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-zinc-200">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        return (
          <div
            key={i}
            className={`border-r border-b border-zinc-200 p-2 relative cursor-pointer
              ${isThisMonth ? "bg-white text-zinc-900" : "bg-white text-zinc-300"}
              ${isToday ? "ring-2 ring-sky-400 ring-offset-1 rounded-md" : ""}
            `}
            onClick={() => onSelect?.(d)}
          >
            <div className="text-sm">{d.date()}</div>
            {/* 여기에 일정 배지 등 넣으면 됨 */}
          </div>
        )
      })}
    </div>
  )
}
