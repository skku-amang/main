"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"

interface MobileTimeSlotsProps {
  selectedDate: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

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

  if (dayRentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm">예약이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {dayRentals.map((rental) => {
        const start = dayjs(rental.startAt)
        const end = dayjs(rental.endAt)
        const isToday = start.isSame(dayjs(), "day")
        const timeRange = `${start.format("h:mmA")} - ${end.format("h:mmA")}`
        const userLabel =
          rental.users.length <= 1
            ? (rental.users[0]?.name ?? "")
            : `${rental.users[0]?.name} 외 ${rental.users.length - 1}명`

        return (
          <div
            key={rental.id}
            className={`flex w-full items-center rounded-md bg-neutral-50 transition-colors ${onRentalClick ? "cursor-pointer hover:bg-neutral-100" : ""}`}
            style={{ height: 80 }}
            onClick={() => onRentalClick?.(rental)}
          >
            <div className="flex w-[74px] shrink-0 flex-col items-center justify-center">
              <span
                className={`text-base font-semibold leading-tight ${isToday ? "text-blue-500" : "text-zinc-700"}`}
              >
                {start.format("ddd")}
              </span>
              <span
                className={`text-2xl font-semibold leading-8 ${isToday ? "text-blue-500" : "text-zinc-700"}`}
              >
                {start.format("DD")}
              </span>
            </div>
            <div className="h-2/3 w-px bg-gray-200" />
            <div className="flex flex-1 flex-col justify-center gap-[2px] pl-5">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={12} />
                <span className="text-[10px]">{timeRange}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserRound size={12} />
                <span className="text-[10px]">{userLabel}</span>
              </div>
              <span className="text-xs font-semibold text-zinc-600">
                {rental.title}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
