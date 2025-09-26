import dayjs, { Dayjs } from "dayjs"
import { Dispatch, SetStateAction } from "react"

interface MobileMonthBlockProps {
  focusDay: Dayjs
  setFocusDay: Dispatch<SetStateAction<Dayjs>>
  days: Dayjs[]
  currentMonth: Dayjs
  onSelect?(d: Dayjs): void
}

export default function MobileMonthBlock({
  focusDay,
  setFocusDay,
  days,
  currentMonth
}: MobileMonthBlockProps) {
  return (
    <div className="grid grid-cols-7 border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(dayjs(), "day")
        const isFocused = d.isSame(focusDay, "day") // ✅ 선택된 날짜 확인

        return (
          <div
            key={i}
            className="flex-1 flex justify-center items-center h-12"
            onClick={() => setFocusDay(d)} // ✅ 날짜 클릭 시 focusDay 갱신
          >
            <div
              className={`flex h-2/3 w-[60%] font-medium text-base justify-center items-center cursor-pointer
                ${isThisMonth ? "text-black" : "text-neutral-300"} 
                ${isToday ? "text-third" : ""} 
                ${isFocused ? "bg-blue-50 rounded-full" : ""}`}
            >
              {d.date()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
