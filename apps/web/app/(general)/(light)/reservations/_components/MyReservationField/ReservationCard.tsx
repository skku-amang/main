import { Clock, UserRound } from "lucide-react"
import dayjs from "dayjs"

interface ReservationCardProps {
  title: string
  startAt: Date
  endAt: Date
  userLabel: string
  isToday?: boolean
  onClick?: () => void
}

export default function ReservationCard({
  title,
  startAt,
  endAt,
  userLabel,
  isToday,
  onClick
}: ReservationCardProps) {
  const start = dayjs(startAt)
  const timeRange = `${start.format("HH:mm")} - ${dayjs(endAt).format("HH:mm")}`

  return (
    <div
      className={`w-full h-20 flex items-center bg-neutral-50 rounded-md transition-colors ${onClick ? "cursor-pointer hover:bg-neutral-100" : ""}`}
      onClick={onClick}
    >
      <div className="w-[74px] flex flex-col items-center justify-center h-full">
        <span
          className={`text-base font-semibold leading-tight ${isToday ? "text-primary" : "text-zinc-700"}`}
        >
          {start.format("ddd")}
        </span>
        <span
          className={`text-2xl font-semibold leading-8 ${isToday ? "text-primary" : "text-zinc-700"}`}
        >
          {start.format("DD")}
        </span>
      </div>
      <div className="w-[1px] h-2/3 bg-gray-200" />
      <div className="flex-1 text-zinc-600 gap-[2px] flex-col justify-center flex pl-5 h-full">
        <div className="flex justify-start gap-2 items-center">
          <Clock size={12} />
          <span className="text-[10px] font-normal">{timeRange}</span>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <UserRound size={12} />
          <span className="text-[10px] font-normal">{userLabel}</span>
        </div>
        <span className="text-zinc-600 font-semibold text-xs">{title}</span>
      </div>
    </div>
  )
}
