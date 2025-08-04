import { Dayjs } from "dayjs"
import WeekColumn from "./WeekColumn"

interface WeekCalendarFieldProp {
  currentMonday: Dayjs
}

export default function WeekCalendarField({
  currentMonday
}: WeekCalendarFieldProp) {
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
      <div className="flex-1 flex">
        {Array.from({ length: 7 }).map((_, i) => (
          <WeekColumn offset={i} currentMonday={currentMonday} key={i} />
        ))}
      </div>
    </div>
  )
}
