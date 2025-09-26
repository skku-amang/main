// MonthBlock.tsx
import dayjs, { Dayjs } from "dayjs"

interface MobileMonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  onSelect?(d: Dayjs): void
}

export default function MobileMonthBlock({
  days,
  currentMonth
}: MobileMonthBlockProps) {
  return (
    <div className="grid grid-cols-7 border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(dayjs(), "day") // ✅ 오늘 날짜 비교

        return (
          <div key={i} className="flex-1 h-12">
            <div
              className={`flex h-full font-medium text-base justify-center items-center
          ${isThisMonth ? "text-black" : "text-neutral-300"} 
          ${isToday ? "text-third" : ""}`}
            >
              {d.date()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
