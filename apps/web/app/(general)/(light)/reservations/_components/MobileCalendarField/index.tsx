import { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import MobileMonthBlock from "./MobileMonthBlock"

interface MobileCalendarFieldProps {
  currentMonday: Dayjs
  rentals: RentalDetail[]
  onDateSelect?: (date: Dayjs) => void
  selectedDate?: Dayjs | null
}

export default function MobileCalendarField({
  currentMonday,
  rentals,
  onDateSelect,
  selectedDate
}: MobileCalendarFieldProps) {
  const DayLabel = ["S", "M", "T", "W", "T", "F", "S"]

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
    <div className="relative mx-auto flex w-full flex-col bg-white px-4 pb-4 pt-16">
      <div className="flex w-full">
        {DayLabel.map((Day, i) => (
          <div
            className="flex h-10 flex-1 items-center justify-center text-[15px] font-semibold text-blue-600"
            key={i}
          >
            {Day}
          </div>
        ))}
      </div>
      <MobileMonthBlock
        days={daysInGrid}
        currentMonth={currentMonth}
        rentals={rentals}
        onSelect={onDateSelect}
        selectedDate={selectedDate}
      />
    </div>
  )
}
