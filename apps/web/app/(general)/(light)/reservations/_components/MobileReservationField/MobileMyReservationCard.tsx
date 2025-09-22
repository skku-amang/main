import { DateSplit } from "@/lib/utils"

export interface Reservation {
  start: string
  end: string
  user: string
  title: string
}

interface MobileMyReservationCardProps {
  reservation: Reservation
}

export default function MobileMyReservationCard({
  reservation
}: MobileMyReservationCardProps) {
  return (
    <div className="w-full rounded-lg flex bg-white h-28">
      <div className="w-16 h-full">{DateSplit(reservation).day}</div>
    </div>
  )
}
