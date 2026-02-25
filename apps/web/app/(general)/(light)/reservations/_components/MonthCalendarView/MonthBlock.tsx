// MonthBlock.tsx
import dayjs, { Dayjs } from "dayjs"

interface MonthBlockProps {
  calendarDates: Dayjs[]
  visibleMonth: Dayjs
  onSelect?(date: Dayjs): void
}

export default function MonthBlock({
  calendarDates,
  visibleMonth
}: MonthBlockProps) {
  return (
    <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-gray-100">
      {calendarDates.map((date) => {
        const isInVisibleMonth = date.month() === visibleMonth.month()
        const isToday = date.isSame(dayjs(), "day")

        return (
          <div
            key={date.toISOString()}
            className="border-r border-b border-gray-100 p-2"
          >
            <div
              className={`
                flex justify-center items-center text-[11px]
                ${isToday ? "bg-black text-white size-5 rounded-full mx-auto" : ""}
                ${isInVisibleMonth ? "text-black" : "text-neutral-300"}
              `}
            >
              {date.date()}
            </div>

            {/* 일정 배지 등 */}
          </div>
        )
      })}
    </div>
  )
}
