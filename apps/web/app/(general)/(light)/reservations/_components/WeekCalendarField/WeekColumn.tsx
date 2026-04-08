import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { getRentalColor } from "../rentalColors"

interface WeekColumnProp {
  currentMonday: Dayjs
  offset: number
  nowTopPx: number
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
  startHour: number
  slotCount: number
}

const PX_PER_HOUR = 42
const HEADER_PX = 42

export default function WeekColumn({
  currentMonday,
  nowTopPx,
  offset,
  rentals,
  onRentalClick,
  startHour,
  slotCount
}: WeekColumnProp) {
  const date = currentMonday.add(offset, "day")
  const dayName = date.format("ddd")
  const dayNumber = date.format("D")
  const isToday = date.isSame(new Date(), "day")

  // 해당 날짜에 걸치는 모든 이벤트 (당일 시작 + 전날 시작~오늘 종료)
  const dayRentals = rentals.filter((r) => {
    const s = dayjs(r.startAt)
    const e = dayjs(r.endAt)
    return (
      s.isSame(date, "day") ||
      (s.isBefore(date, "day") && e.isAfter(date.startOf("day")))
    )
  })

  return (
    <div className="w-[14.28%] relative overflow-hidden border-x-[1.5px] border-gray-100">
      {/* 헤더: 요일 + 날짜 */}
      <div className="w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center gap-1">
        <span>{dayName}</span>
        {isToday ? (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white">
            {dayNumber}
          </div>
        ) : (
          <span>{dayNumber}</span>
        )}
      </div>

      {/* 시간 구간 */}
      {Array.from({ length: slotCount }).map((_, i) => (
        <div
          key={i}
          className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        ></div>
      ))}

      {/* 예약 이벤트 블록 */}
      {dayRentals.map((rental) => {
        const start = dayjs(rental.startAt)
        const end = dayjs(rental.endAt)
        const totalMin = slotCount * 60
        const rawStartMin = start.isSame(date, "day")
          ? (start.hour() - startHour) * 60 + start.minute()
          : 0
        const startMin = Math.max(0, rawStartMin)
        const rawEndMin = end.isSame(date, "day")
          ? (end.hour() - startHour) * 60 + end.minute()
          : totalMin
        const endMin = Math.max(0, Math.min(totalMin, rawEndMin))
        if (endMin <= startMin) return null
        const topPx = HEADER_PX + (startMin * PX_PER_HOUR) / 60
        const heightPx = ((endMin - startMin) * PX_PER_HOUR) / 60
        const color = getRentalColor(rental.id)

        return (
          <div
            key={rental.id}
            className={`absolute left-0.5 right-0.5 ${color.bg} border-l-2 ${color.border} rounded-r-sm px-1 overflow-hidden cursor-pointer ${color.hoverBg} transition-colors`}
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            title={`${rental.title}\n${start.format("h:mmA")} - ${end.format("h:mmA")}`}
            onClick={() => onRentalClick?.(rental)}
          >
            {heightPx > 30 && (
              <div
                className={`flex items-center gap-0.5 text-[10px] ${color.text} opacity-70`}
              >
                <Clock size={10} className="shrink-0" />
                <span>
                  {start.format("h:mmA")} - {end.format("h:mmA")}
                </span>
              </div>
            )}
            {heightPx > 45 && rental.users.length > 0 && (
              <div
                className={`flex items-center gap-0.5 text-[10px] ${color.text} opacity-70`}
              >
                <UserRound size={10} className="shrink-0" />
                <span className="truncate">
                  {rental.users.length <= 1
                    ? (rental.users[0]?.name ?? "")
                    : `${rental.users[0]?.name} 외 ${rental.users.length - 1}명`}
                </span>
              </div>
            )}
            <p className={`text-xs font-semibold ${color.text} truncate`}>
              {rental.title}
            </p>
          </div>
        )
      })}

      {/* 오늘일 경우 현재시간 라인 */}
      {isToday && (
        <div
          className="absolute h-[2px] -translate-y-1/2 w-full bg-destructive"
          style={{ top: `${nowTopPx}px` }}
        >
          <div className="w-full relative">
            <div className="absolute h-5 w-[1.5px] -translate-y-1/2 -left-[1px] bg-destructive" />
            <div className="absolute h-5 w-[1.5px] -translate-y-1/2 -right-[1px] bg-destructive" />
          </div>
        </div>
      )}
    </div>
  )
}
