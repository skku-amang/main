"use client"

import dayjs from "dayjs"
import { useSession } from "next-auth/react"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"

interface MobileMyReservationsProps {
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
}

export default function MobileMyReservations({
  rentals,
  onRentalClick
}: MobileMyReservationsProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id ? Number(session.user.id) : null

  const myRentals = userId
    ? rentals
        .filter((r) => r.users.some((u) => u.id === userId))
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        )
    : []

  if (myRentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm">예약이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {myRentals.map((rental) => {
        const start = dayjs(rental.startAt)
        const end = dayjs(rental.endAt)
        const isToday = start.isSame(dayjs(), "day")
        const timeRange = `${start.format("HH:mm")} - ${end.format("HH:mm")}`
        const userLabel =
          rental.users.length <= 1
            ? (rental.users[0]?.name ?? "")
            : `${rental.users[0]?.name} 외 ${rental.users.length - 1}명`

        return (
          <div
            key={rental.id}
            className="flex cursor-pointer items-center border-b border-gray-50 px-1 py-3 transition-colors hover:bg-gray-50"
            onClick={() => onRentalClick?.(rental)}
          >
            {/* Day/Date */}
            <div className="flex w-16 shrink-0 flex-col items-center justify-center">
              <span
                className={`text-sm font-semibold ${isToday ? "text-blue-600" : "text-zinc-600"}`}
              >
                {start.format("ddd")}
              </span>
              <span
                className={`text-xl font-semibold ${isToday ? "text-blue-600" : "text-zinc-700"}`}
              >
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
  )
}
