import dayjs, { Dayjs } from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import MonthBlock from "./MonthBlock"

dayjs.extend(isoWeek)

interface MonthCalendarFieldProps {
  currentMonday: Dayjs
}

export default function MonthCalendarField({
  currentMonday
}: MonthCalendarFieldProps) {
  const WeekLabelList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // 1) 이 달의 첫째 날
  const currentMonth = currentMonday.startOf("month")

  // 2) 월간 그리드의 시작/끝 (월~일 기준, ISO 주)
  const gridStart = currentMonth.startOf("isoWeek")
  const gridEnd = currentMonth.endOf("month").endOf("isoWeek")

  // 3) 그리드에 들어갈 모든 날짜 생성
  const daysInGrid: Dayjs[] = []
  for (
    let d = gridStart;
    d.isBefore(gridEnd) || d.isSame(gridEnd, "day");
    d = d.add(1, "day")
  ) {
    daysInGrid.push(d)
  }

  return (
    <div className="w-full mt-7 flex flex-col bg-white">
      {/* 요일 헤더 */}
      <div className="w-full flex">
        {WeekLabelList.map((label) => (
          <div
            key={label}
            className="flex-1 flex justify-center h-10 bg-gray-100 text-black text-[13px] font-medium items-center"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 월간 그리드 */}
      <MonthBlock days={daysInGrid} currentMonth={currentMonth} />
    </div>
  )
}
