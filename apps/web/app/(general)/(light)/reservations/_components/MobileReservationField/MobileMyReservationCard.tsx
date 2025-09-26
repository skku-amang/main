import { ReservationSplit } from "@/lib/utils"
import dayjs from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { Reservation } from "."

interface MobileMyReservationCardProps {
  reservation: Reservation
}

export default function MobileMyReservationCard({
  reservation
}: MobileMyReservationCardProps) {
  const splitedReservation = ReservationSplit(reservation)
  const startDay = dayjs(reservation.start).format("YYYY-MM-DD")
  const today = dayjs().format("YYYY-MM-DD")

  const isToday = startDay === today
  return (
    <div className="w-full rounded-lg flex bg-white h-24">
      <div
        className={`min-w-[84px] flex justify-center items-center flex-col gap-[2px] ${isToday ? `text-third` : `text-neutral-600`}`}
      >
        <div className="font-semibold text-base">
          {splitedReservation.dayOfTheWeek}
        </div>
        <div className={`font-semibold text-2xl`}>{splitedReservation.day}</div>
      </div>
      <div className="w-[2px] my-3 bg-gray-100" />
      <div className="w-full h-full flex flex-col justify-center text-gray-600 pl-6">
        <div className="flex gap-2 text-[10px] items-center">
          <Clock size={10} />
          <span className="text-xs">{`${splitedReservation.startTime} - ${splitedReservation.endTime}`}</span>
        </div>
        <div className="flex gap-2 text-[10px] items-center">
          <UserRound size={10} />
          <span className="text-xs">{reservation.user}</span>
        </div>
        <div className="zinc-600 pt-2 text-xs font-semibold">
          {reservation.title}
        </div>
      </div>
    </div>
  )
}
