import { Clock, UserRound } from "lucide-react"
import { Reservation } from "../MobileReservationSection"
import { reservationSplit } from "@/lib/utils"
import dayjs from "dayjs"

interface ReservationCardProps {
  reservation: Reservation
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const splitedReservation = reservationSplit(reservation)
  const startDay = dayjs(reservation.start).format("YYYY-MM-DD")
  const today = dayjs().format("YYYY-MM-DD")
  const isToday = startDay === today
  return (
    <div className="w-full h-20 flex items-center bg-neutral-50 rounded-md">
      <div
        className={`w-[74px] ${isToday ? `*:text-third` : `*:text-neutral-600`} text-zinc-700 flex flex-col items-center justify-center h-full`}
      >
        <span className="text-base font-semibold leading-tight">
          {splitedReservation.dayOfTheWeek}
        </span>
        <span className="text-2xl font-semibold leading-8">
          {splitedReservation.day}
        </span>
      </div>
      <div className="w-[1px] h-2/3 bg-gray-200" />
      <div className="flex-1 text-zinc-600 gap-[2px] flex-col justify-center flex pl-5 h-full">
        <div className="flex justify-start gap-2 items-center">
          <Clock size={12} />
          <span className="text-[10px] font-normal">
            {splitedReservation.startTime} - {splitedReservation.endTime}
          </span>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <UserRound size={12} />
          <span className="text-[10px] font-normal">{reservation.user}</span>
        </div>
        <span className="text-zinc-600 font-semibold text-xs">
          {reservation.title}
        </span>
      </div>
    </div>
  )
}
