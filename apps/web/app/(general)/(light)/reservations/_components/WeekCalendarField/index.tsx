import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import WeekColumn from "./WeekColumn"

interface WeekCalendarFieldProp {
  currentMonday: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

const DEFAULT_START = 6
const DEFAULT_END = 22
const ROW_H = 42

export default function WeekCalendarField({
  currentMonday,
  rentals,
  onRentalClick
}: WeekCalendarFieldProp) {
  // 주간 전체 rental의 시간 범위로 동적 확장
  const rentalHours = rentals.map((r) => dayjs(r.startAt).hour())
  const startHour = Math.min(DEFAULT_START, ...rentalHours)
  const endHour = Math.max(DEFAULT_END, ...rentalHours)
  const slotCount = endHour - startHour + 1
  const totalMin = slotCount * 60

  const currentTime = new Date()
  const h = currentTime.getHours()
  const m = currentTime.getMinutes()
  const minutesSinceStart = (h - startHour) * 60 + m
  const clampedMin = Math.max(0, Math.min(totalMin, minutesSinceStart))
  const nowTopPx = (clampedMin * ROW_H) / 60 + 42

  const timeLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
  return (
    <div className="w-full mt-7 flex bg-white rounded-xl overflow-hidden">
      <div className="w-7 flex flex-col shrink-0">
        <div className="h-[42px]" />
        {Array.from({ length: slotCount }).map((_, i) => {
          const absHour = i + startHour
          const hour = absHour % 12 === 0 ? 12 : absHour % 12
          const isPM = absHour >= 12

          return (
            <div
              key={i}
              className="text-[8px] w-full h-[42px] text-center text-gray-400"
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
            onRentalClick={onRentalClick}
            startHour={startHour}
            slotCount={slotCount}
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
