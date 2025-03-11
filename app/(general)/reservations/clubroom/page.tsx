import { ChevronRight, HouseIcon } from "lucide-react"
import Link from "next/link"

const ReservationPage = () => {
  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="flex flex-col items-center ">
        <div className="mb-8 mt-24 flex h-14 w-full items-center justify-center text-5xl font-semibold text-black">
          동아리방 예약
        </div>
        <div className="mb-20 flex h-5 w-full items-center justify-center gap-1">
          <Link href="/">
            <HouseIcon className="h-5 w-5 text-slate-400" />
          </Link>
          <ChevronRight className="h-5 w-5 text-slate-400" />
          <div className="text-sm font-medium leading-tight text-slate-400">
            예약
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
          <div className="text-sm font-medium leading-tight text-primary">
            동아리방 예약
          </div>
        </div>
      </div>
      <div className="flex h-full w-full justify-center bg-neutral-300">
        이곳에 작업하면 됩니다.
      </div>
    </div>
  )
}

export default ReservationPage
