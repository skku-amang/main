import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import MonthBlock from "./MonthBlock"

interface MonthCalendarFieldProps {
  currentMonday: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

export default function MonthCalendarField({
  currentMonday,
  rentals,
  onRentalClick
}: MonthCalendarFieldProps) {
  const WeekLabelList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // 1) 이 달의 첫째 날
  const currentMonth = currentMonday.startOf("month")

  // 2) 월간 그리드의 시작/끝 (일~토 기준)
  const gridStart = currentMonth.startOf("week")
  const gridEnd = currentMonth.endOf("month").endOf("week")

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
    <div className="w-full mt-7 flex flex-col bg-white rounded-xl overflow-hidden">
      {/* 요일 헤더 */}
      <div className="w-full flex">
        {WeekLabelList.map((label) => (
          <div
            key={label}
            className="flex-1 flex justify-center h-10 border-t border-x border-gray-100 bg-gray-50 text-black text-[13px] font-medium items-center"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 월간 그리드 */}
      <MonthBlock
        days={daysInGrid}
        currentMonth={currentMonth}
        rentals={rentals}
        onRentalClick={onRentalClick}
      />
    </div>
  )
}
