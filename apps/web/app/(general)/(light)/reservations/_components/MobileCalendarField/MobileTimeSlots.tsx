"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { useEffect, useRef } from "react"

interface MobileTimeSlotsProps {
  selectedDate: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SCROLL_TO_HOUR = 9

export default function MobileTimeSlots({
  selectedDate,
  rentals,
  onRentalClick
}: MobileTimeSlotsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = containerRef.current?.querySelector(
      `[data-hour="${SCROLL_TO_HOUR}"]`
    )
    target?.scrollIntoView({ block: "start", behavior: "instant" })
  }, [])
  const selectedDay = selectedDate.format("YYYY-MM-DD")
  const dayRentals = rentals
    .filter((r) => dayjs(r.startAt).format("YYYY-MM-DD") === selectedDay)
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
    <div ref={containerRef} className="flex flex-col">
      {HOURS.map((hour) => {
        const hourRentals = rentalsByHour.get(hour)
        return (
          <div key={hour} data-hour={hour} className="flex min-h-[44px]">
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
                    className={`my-1 flex items-center border-b border-gray-50 px-1 py-3 transition-colors ${onRentalClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                    onClick={() => onRentalClick?.(rental)}
                  >
                    {/* Day/Date */}
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center">
                      <span className="text-sm font-semibold text-zinc-600">
                        {start.format("ddd")}
                      </span>
                      <span className="text-xl font-semibold text-zinc-700">
                        {start.format("DD")}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mx-2 h-10 w-px bg-gray-200" />

                    {/* Details */}
                    <div className="flex flex-1 flex-col gap-0.5 pl-2">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={11} />
                        <span className="text-[11px]">{timeRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <UserRound size={11} />
                        <span className="text-[11px]">{userLabel}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-600">
                        {rental.title}
                      </span>
                    </div>
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
