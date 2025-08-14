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
  const dayLabel = date.format("ddd D") // 예: "Tue 9"
  const isToday = date.isSame(new Date(), "day")

  return (
    <div className="w-[14.28%] relative border-x-[1.5px] border-gray-100">
      <div className="w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center">
        {dayLabel}
      </div>
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        ></div>
      ))}
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
