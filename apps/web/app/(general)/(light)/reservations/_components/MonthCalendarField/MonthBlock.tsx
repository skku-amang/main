// MonthBlock.tsx
import { Dayjs } from "dayjs"

interface MonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  onSelect?(d: Dayjs): void
}

export default function MonthBlock({ days, currentMonth }: MonthBlockProps) {
  return (
    <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        return (
          <div key={i} className="border-r border-b border-gray-100 p-2">
            <div
              className={`flex text-[11px] justify-center items-center ${isToday ? "bg-black text-white size-5 rounded-full mx-auto" : ""} 
                ${isThisMonth ? "text-black" : "text-neutral-300"}`}
            >
              {d.date()}
            </div>

            {/* 여기에 일정 배지 등 넣으면 됨 */}
          </div>
        )
      })}
    </div>
  )
}
