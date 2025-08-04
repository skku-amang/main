import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Dayjs } from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SmallCalendarProp {
  setCalendarViewMonth: React.Dispatch<React.SetStateAction<Dayjs>>
  monthLabel: string
  daysInCalendar: Dayjs[]
  setCurrentMonday: React.Dispatch<React.SetStateAction<Dayjs>>
  calendarViewMonth: Dayjs
}

export default function SmallCalendar({
  setCalendarViewMonth,
  monthLabel,
  daysInCalendar,
  setCurrentMonday,
  calendarViewMonth
}: SmallCalendarProp) {
  const dayList = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  return (
    <DropdownMenuContent className="mt-3 border-zinc-200 shadow-sm border-[1.5px] w-[300px]">
      <DropdownMenuLabel>
        <div className="w-full items-center text-zinc-950 font-medium text-sm flex justify-between">
          {/* 왼쪽 화살표: 전달로 이동 */}
          <div
            onClick={() =>
              setCalendarViewMonth((prev) => prev.subtract(1, "month"))
            }
            className="flex justify-center items-center size-7 rounded-sm border-[1px] border-zinc-200 cursor-pointer hover:bg-zinc-100"
          >
            <ChevronLeft size={16} />
          </div>

          <span>{monthLabel}</span>

          {/* 오른쪽 화살표: 다음달로 이동 */}
          <div
            onClick={() => setCalendarViewMonth((prev) => prev.add(1, "month"))}
            className="flex justify-center items-center size-7 rounded-sm border-[1px] border-zinc-200 cursor-pointer hover:bg-zinc-100"
          >
            <ChevronRight size={16} />
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuItem className="p-0 px-2">
        <div className="w-full pt-3 grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              className="w-1/7 h-7 text-zinc-500 text-[12.8px] flex justify-center transition-colors rounded-sm items-center"
              key={dayList[i]}
            >
              {dayList[i]}
            </div>
          ))}
          {daysInCalendar.map((date, i) => {
            const isCurrentMonth = date.month() === calendarViewMonth.month()
            return (
              <div
                key={i}
                onClick={() => setCurrentMonday(date.startOf("isoWeek"))}
                className={`h-9 text-sm flex justify-center items-center rounded-sm cursor-pointer duration-150 transition-colors
    ${isCurrentMonth ? "text-zinc-950" : "text-zinc-300"}
    hover:bg-sky-50`}
              >
                {date.date()}
              </div>
            )
          })}
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
