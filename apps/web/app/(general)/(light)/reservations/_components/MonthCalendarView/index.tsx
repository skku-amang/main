import dayjs, { Dayjs } from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import MonthBlock from "./MonthBlock"

dayjs.extend(isoWeek)

interface MonthCalendarFieldProps {
  currentMonday: Dayjs
}

export default function MonthCalendarView({
  currentMonday
}: MonthCalendarFieldProps) {
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const visibleMonth = currentMonday.startOf("month")

  const calendarStartDate = visibleMonth.startOf("isoWeek")
  const calendarEndDate = visibleMonth.endOf("month").endOf("isoWeek")

  const calendarDates: Dayjs[] = []
  for (
    let date = calendarStartDate;
    date.isBefore(calendarEndDate) || date.isSame(calendarEndDate, "day");
    date = date.add(1, "day")
  ) {
    calendarDates.push(date)
  }

  return (
    <div className="w-full mt-7 flex flex-col bg-white">
      {/* 요일 헤더 */}
      <div className="w-full flex">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="flex-1 flex justify-center h-10 border-t border-x border-gray-100 bg-gray-50 text-black text-[13px] font-medium items-center"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 월간 그리드 */}
      <MonthBlock calendarDates={calendarDates} visibleMonth={visibleMonth} />
    </div>
  )
}
