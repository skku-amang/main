import { Dayjs } from "dayjs"

import MobileMonthBlock from "./MobileMonthBlock"

interface MobileCalendarFieldProps {
  currentMonday: Dayjs
}

export default function MobileCalendarField({
  currentMonday
}: MobileCalendarFieldProps) {
  const DayLabel = ["M", "T", "W", "T", "F", "S", "S"]

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
    <div className="w-full h-auto px-2 relative flex flex-col mx-auto bg-white pt-16 pb-5">
      <div className="w-full flex">
        {DayLabel.map((Day, i) => (
          <div
            className="flex-1 font-medium h-11 flex justify-center items-center text-base text-secondary"
            key={DayLabel[i]}
          >
            {Day}
          </div>
        ))}
      </div>
      <MobileMonthBlock days={daysInGrid} currentMonth={currentMonth} />
    </div>
  )
}
