import { Dayjs } from "dayjs"

interface WeekColumnProp {
  currentMonday: Dayjs
  offset: number
}

export default function WeekColumn({ currentMonday, offset }: WeekColumnProp) {
  const date = currentMonday.add(offset, "day")
  const dayLabel = date.format("ddd D") // 예: "Tue 9"

  return (
    <div className="w-[14.28%] border-x-[1.5px] border-gray-100">
      <div className="w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center">
        {dayLabel}
      </div>
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        ></div>
      ))}
    </div>
  )
}
