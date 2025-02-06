import { ChevronRight, HouseIcon } from "lucide-react"
import Link from "next/link"

const ReservationPage = () => {
  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="flex flex-col items-center ">
        <div className="mb-[30px] mt-[95px] flex h-[57px] w-[500px] items-center justify-center text-5xl font-semibold text-black">
          물품 대여
        </div>
        <div className="mb-[74px] flex h-[20px] w-[200px] items-center justify-center gap-1">
          <Link href="/">
            <HouseIcon className="h-[20px] w-[20px] text-slate-400" />
          </Link>
          <ChevronRight className="h-[20px] w-[20px] text-slate-400" />
          <div className="text-sm font-medium leading-tight text-slate-400">
            예약
          </div>
          <ChevronRight className="h-[20px] w-[20px] text-slate-400" />
          <div className="text-sm font-medium leading-tight text-primary">
            물품 대여
          </div>
        </div>
      </div>
      <div className="flex h-[739px] w-full justify-center bg-neutral-500">
        이곳에 작업하면 됩니다.
      </div>
    </div>
  )
}

export default ReservationPage
