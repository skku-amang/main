import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"

interface WeekColumnProp {
  currentMonday: Dayjs
  offset: number
  nowTopPx: number
  rentals: RentalDetail[]
}

const START_HOUR = 7
const PX_PER_HOUR = 42
const HEADER_PX = 42

export default function WeekColumn({
  currentMonday,
  nowTopPx,
  offset,
  rentals
}: WeekColumnProp) {
  const date = currentMonday.add(offset, "day")
  const dayName = date.format("ddd")
  const dayNumber = date.format("D")
  const isToday = date.isSame(new Date(), "day")

  const dayRentals = rentals.filter((r) => dayjs(r.startAt).isSame(date, "day"))

  return (
    <div className="w-[14.28%] relative border-x-[1.5px] border-gray-100">
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
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        ></div>
      ))}

      {/* 예약 이벤트 블록 */}
      {dayRentals.map((rental) => {
        const start = dayjs(rental.startAt)
        const end = dayjs(rental.endAt)
        const startMin = (start.hour() - START_HOUR) * 60 + start.minute()
        const endMin = (end.hour() - START_HOUR) * 60 + end.minute()
        const topPx = HEADER_PX + (startMin * PX_PER_HOUR) / 60
        const heightPx = ((endMin - startMin) * PX_PER_HOUR) / 60

        return (
          <div
            key={rental.id}
            className="absolute left-0.5 right-0.5 bg-primary/20 border-l-2 border-primary rounded-r-sm px-1 overflow-hidden cursor-pointer hover:bg-primary/30 transition-colors"
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            title={`${rental.title}\n${start.format("h:mmA")} - ${end.format("h:mmA")}`}
          >
            <p className="text-[10px] font-semibold text-primary truncate">
              {rental.title}
            </p>
            {heightPx > 30 && (
              <p className="text-[8px] text-primary/70">
                {start.format("h:mm")} - {end.format("h:mm")}
              </p>
            )}
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
