"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"

interface MobileTimeSlotsProps {
  selectedDate: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

/** Hours to display in the time-slot list (09:00 – 23:00) */
const HOURS = Array.from({ length: 15 }, (_, i) => i + 9)

export default function MobileTimeSlots({
  selectedDate,
  rentals,
  onRentalClick
}: MobileTimeSlotsProps) {
  const dayRentals = rentals
    .filter((r) => dayjs(r.startAt).isSame(selectedDate, "day"))
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )

  /** Group rentals by the hour they START in */
  const rentalsByHour = new Map<number, RentalDetail[]>()
  for (const rental of dayRentals) {
    const hour = dayjs(rental.startAt).hour()
    const list = rentalsByHour.get(hour) ?? []
    list.push(rental)
    rentalsByHour.set(hour, list)
  }

  return (
    <div className="flex flex-col">
      {HOURS.map((hour) => {
        const hourRentals = rentalsByHour.get(hour)
        return (
          <div key={hour} className="flex min-h-[44px]">
            {/* Hour label */}
            <div className="w-14 shrink-0 pt-3 text-sm font-medium text-zinc-500">
              {String(hour).padStart(2, "0")}:00
            </div>

            {/* Separator + events */}
            <div className="flex flex-1 flex-col border-t border-gray-100 py-1">
              {hourRentals?.map((rental) => {
                const start = dayjs(rental.startAt)
                const end = dayjs(rental.endAt)
                const timeRange = `${start.format("HH:mm")} - ${end.format("HH:mm")}`
                const userLabel =
                  rental.users.length <= 1
                    ? (rental.users[0]?.name ?? "")
                    : `${rental.users[0]?.name} 외 ${rental.users.length - 1}명`

                return (
                  <div
                    key={rental.id}
                    className={`my-1 rounded-md bg-neutral-50 px-3 py-2 ${onRentalClick ? "cursor-pointer hover:bg-neutral-100" : ""}`}
                    onClick={() => onRentalClick?.(rental)}
                  >
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span className="text-[11px]">{timeRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserRound size={12} />
                        <span className="text-[11px]">{userLabel}</span>
                      </div>
                    </div>
                    <span className="mt-0.5 block text-sm font-bold text-zinc-700">
                      {rental.title}
                    </span>
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
