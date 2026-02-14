import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"

interface MonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  rentals: RentalDetail[]
  onSelect?(d: Dayjs): void
}

export default function MonthBlock({
  days,
  currentMonth,
  rentals
}: MonthBlockProps) {
  return (
    <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        const dayRentals = rentals.filter((r) =>
          dayjs(r.startAt).isSame(d, "day")
        )

        return (
          <div key={i} className="border-r border-b border-gray-100 p-2">
            <div
              className={`flex text-[11px] justify-center items-center ${isToday ? "bg-black text-white size-5 rounded-full mx-auto" : ""}
                ${isThisMonth ? "text-black" : "text-neutral-300"}`}
            >
              {d.date()}
            </div>

            {dayRentals.slice(0, 3).map((rental) => (
              <div
                key={rental.id}
                className="mt-1 text-[9px] leading-tight bg-primary/10 text-primary rounded px-1 py-0.5 truncate"
              >
                {rental.title}
              </div>
            ))}
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
