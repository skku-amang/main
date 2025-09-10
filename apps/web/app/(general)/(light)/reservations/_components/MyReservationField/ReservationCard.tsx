import { Clock, UserRound } from "lucide-react"

export default function ReservationCard() {
  return (
    <div className="w-full h-20 flex items-center bg-neutral-50 rounded-md">
      <div className="w-[74px] text-zinc-700 flex flex-col items-center justify-center h-full">
        <span className="text-base font-semibold leading-tight">Mon</span>
        <span className="text-2xl font-semibold leading-8">07</span>
      </div>
      <div className="w-[1px] h-2/3 bg-gray-200" />
      <div className="flex-1 text-zinc-600 gap-[2px] flex-col justify-center flex pl-5 h-full">
        <div className="flex justify-start gap-2 items-center">
          <Clock size={12} />
          <span className="text-[10px] font-normal">12:00AM - 11:59PM</span>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <UserRound size={12} />
          <span className="text-[10px] font-normal">김수연 외 3명</span>
        </div>
        <span className="text-zinc-600 font-semibold text-xs">밤편지 합주</span>
      </div>
    </div>
  )
}
