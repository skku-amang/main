import { Dayjs } from "dayjs"

interface WeekColumnProp {
  currentMonday: Dayjs
  offset: number
  nowTopPx: number
}

export default function WeekColumn({
  currentMonday,
  nowTopPx,
  offset
}: WeekColumnProp) {
  const date = currentMonday.add(offset, "day")
  const dayName = date.format("ddd") // 예: "Tue"
  const dayNumber = date.format("D") // 예: "8"
  const isToday = date.isSame(new Date(), "day")

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
