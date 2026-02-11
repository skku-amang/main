import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"

interface MobileMonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  rentals: RentalDetail[]
  onSelect?(d: Dayjs): void
}

export default function MobileMonthBlock({
  days,
  currentMonth,
  rentals
}: MobileMonthBlockProps) {
  return (
    <div className="grid grid-cols-7 border-gray-100">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        const hasRentals = rentals.some((r) =>
          dayjs(r.startAt).isSame(d, "day")
        )

        return (
          <div key={i} className="flex-1 h-12">
            <div
              className={`flex h-full font-medium text-base justify-center items-center flex-col
                ${isThisMonth ? "text-black" : "text-neutral-300"}`}
            >
              <span
                className={
                  isToday
                    ? "w-7 h-7 flex items-center justify-center rounded-full bg-black text-white"
                    : ""
                }
              >
                {d.date()}
              </span>
              {hasRentals && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
