"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { getRentalColor } from "../rentalColors"

interface MobileTimeSlotsProps {
  selectedDate: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

const START_HOUR = 6
const END_HOUR = 22

export default function MobileTimeSlots({
  selectedDate,
  rentals,
  onRentalClick
}: MobileTimeSlotsProps) {
  const dayRentals = rentals.filter((r) =>
    dayjs(r.startAt).isSame(selectedDate, "day")
  )

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => i + START_HOUR
  )

  const getRentalsAtHour = (hour: number) => {
    return dayRentals.filter((r) => {
      const startHour = dayjs(r.startAt).hour()
      return startHour === hour
    })
  }

  return (
    <div className="flex flex-col">
      {hours.map((hour) => {
        const rentalsAtHour = getRentalsAtHour(hour)
        const hasContent = rentalsAtHour.length > 0
        const formattedHour = `${hour.toString().padStart(2, "0")}:00`

        return (
          <div key={hour} className="flex min-h-[48px] border-b border-gray-50">
            {/* Time label */}
            <div
              className={`w-[52px] shrink-0 pt-2.5 text-center text-[15px] font-medium tracking-wide ${
                hasContent ? "font-semibold text-blue-600" : "text-neutral-500"
              }`}
            >
              {formattedHour}
            </div>

            {/* Content area */}
            <div className="flex-1 py-1.5">
              {rentalsAtHour.map((rental) => {
                const start = dayjs(rental.startAt)
                const end = dayjs(rental.endAt)
                const color = getRentalColor(rental.id)
                const userLabel =
                  rental.users.length <= 1
                    ? (rental.users[0]?.name ?? "")
                    : `${rental.users[0]?.name} 외 ${rental.users.length - 1}명`

                return (
                  <div
                    key={rental.id}
                    className={`cursor-pointer rounded-md ${color.bg} border-l-2 ${color.border} px-3 py-2 ${color.hoverBg} transition-colors`}
                    onClick={() => onRentalClick?.(rental)}
                  >
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>
                          {start.format("HH:mm")} - {end.format("HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserRound size={10} />
                        <span>{userLabel}</span>
                      </div>
                    </div>
                    <p
                      className={`mt-0.5 text-[13px] font-semibold ${color.text}`}
                    >
                      {rental.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
