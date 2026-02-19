import { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import WeekColumn from "./WeekColumn"

interface WeekCalendarFieldProp {
  currentMonday: Dayjs
  rentals: RentalDetail[]
}

export default function WeekCalendarField({
  currentMonday,
  rentals
}: WeekCalendarFieldProp) {
  // 현재 시간
  const currentTime = new Date()

  // 현재 시간 표시용 계산 (07:00 시작, 15시간 표시)
  const START_HOUR = 7
  const ROW_H = 42 // px per hour
  const TOTAL_MIN = 15 * 60

  const h = currentTime.getHours()
  const m = currentTime.getMinutes()
  const minutesSinceStart = (h - START_HOUR) * 60 + m

  // 보이는 영역 밖으로 나가지 않게 clamp
  const clampedMin = Math.max(0, Math.min(TOTAL_MIN, minutesSinceStart))
  const nowTopPx = (clampedMin * ROW_H) / 60 + 42

  // 말풍선 텍스트 (8:30 PM 형식)
  const timeLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
  return (
    <div className="w-full mt-7 flex bg-white">
      <div className="w-7 flex flex-col">
        {Array.from({ length: 16 }).map((_, i) => {
          const hour = (i + 6) % 12 === 0 ? 12 : (i + 6) % 12
          const isPM = i + 6 >= 12

          return (
            <div
              key={i}
              className="text-[8px] w-full h-[42px] text-center first:text-[0px] text-gray-400"
            >
              {hour}
              {isPM ? "PM" : "AM"}
            </div>
          )
        })}
      </div>
      <div className="flex-1 relative flex">
        {Array.from({ length: 7 }).map((_, i) => (
          <WeekColumn
            nowTopPx={nowTopPx}
            offset={i}
            currentMonday={currentMonday}
            rentals={rentals}
            key={i}
          />
        ))}
        <div
          className="w-full absolute bg-destructive h-[1px]"
          style={{ top: `${nowTopPx}px` }}
        >
          <div className="w-full relative">
            <div className="absolute w-11 flex items-center justify-center -translate-y-1/2 h-4 rounded-lg text-[10px] text-white bg-destructive -left-5">
              {timeLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
