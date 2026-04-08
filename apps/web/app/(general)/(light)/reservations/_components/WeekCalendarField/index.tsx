import { useEffect, useRef } from "react"
import { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import WeekColumn from "./WeekColumn"

interface WeekCalendarFieldProp {
  currentMonday: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

const START_HOUR = 0
const ROW_H = 42
const TOTAL_MIN = 24 * 60
const SCROLL_TO_HOUR = 6

export default function WeekCalendarField({
  currentMonday,
  rentals,
  onRentalClick
}: WeekCalendarFieldProp) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = SCROLL_TO_HOUR * ROW_H
  }, [])

  const currentTime = new Date()
  const h = currentTime.getHours()
  const m = currentTime.getMinutes()
  const minutesSinceStart = (h - START_HOUR) * 60 + m
  const clampedMin = Math.max(0, Math.min(TOTAL_MIN, minutesSinceStart))
  const nowTopPx = (clampedMin * ROW_H) / 60 + 42

  const timeLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
  return (
    <div
      ref={containerRef}
      className="w-full mt-7 flex bg-white rounded-xl overflow-y-auto"
      style={{ maxHeight: `${16 * ROW_H + 42}px` }}
    >
      <div className="w-7 flex flex-col shrink-0">
        <div className="h-[42px]" />
        {Array.from({ length: 24 }).map((_, i) => {
          const hour = i % 12 === 0 ? 12 : i % 12
          const isPM = i >= 12

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
