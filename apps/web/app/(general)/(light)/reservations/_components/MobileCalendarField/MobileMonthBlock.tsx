import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"

interface MobileMonthBlockProps {
  days: Dayjs[]
  currentMonth: Dayjs
  rentals: RentalDetail[]
  onSelect?: (d: Dayjs) => void
  selectedDate?: Dayjs | null
}

export default function MobileMonthBlock({
  days,
  currentMonth,
  rentals,
  onSelect,
  selectedDate
}: MobileMonthBlockProps) {
  return (
    <div className="grid grid-cols-7">
      {days.map((d, i) => {
        const isThisMonth = d.month() === currentMonth.month()
        const isToday = d.isSame(new Date(), "day")
        const isSelected =
          selectedDate && d.isSame(selectedDate, "day") && !isToday
        const hasRentals = rentals.some((r) =>
          dayjs(r.startAt).isSame(d, "day")
        )

        return (
          <div
            key={i}
            className="flex h-[46px] cursor-pointer flex-col items-center justify-center"
            onClick={() => onSelect?.(d)}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[16px] font-medium ${
                isToday
                  ? "bg-zinc-900 text-white"
                  : isSelected
                    ? "bg-blue-100 text-blue-600"
                    : isThisMonth
                      ? "text-zinc-800"
                      : "text-neutral-300"
              }`}
            >
              {d.date()}
            </span>
            {hasRentals && (
              <div className="mt-0.5 h-1 w-1 rounded-full bg-blue-400" />
            )}
          </div>
        )
      })}
    </div>
  )
}
