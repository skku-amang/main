import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import { getRentalColor } from "../rentalColors"

interface MonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

export default function MonthBlock({
  days,
  currentMonth,
  rentals,
  onRentalClick
}: MonthBlockProps) {
  return (
    <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        const dayRentals = rentals.filter((r) => {
          const s = dayjs(r.startAt)
          const e = dayjs(r.endAt)
          return (
            s.isSame(d, "day") ||
            (s.isBefore(d, "day") && e.isAfter(d.startOf("day")))
          )
        })

        return (
          <div key={i} className="border-r border-b border-gray-100 p-2">
            <div
              className={`flex text-[11px] justify-center items-center ${isToday ? "bg-black text-white size-5 rounded-full mx-auto" : ""}
                ${isThisMonth ? "text-black" : "text-neutral-300"}`}
            >
              {d.date()}
            </div>

            {dayRentals.slice(0, 3).map((rental) => {
              const color = getRentalColor(rental.id)
              return (
                <div
                  key={rental.id}
                  className={`mt-1 text-[9px] leading-tight ${color.bg} ${color.text} rounded px-1 py-0.5 truncate cursor-pointer`}
                  onClick={() => onRentalClick?.(rental)}
                >
                  {rental.title}
                </div>
              )
            })}
            {dayRentals.length > 3 && (
              <div className="mt-0.5 text-[9px] text-gray-400 text-center">
                +{dayRentals.length - 3}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
