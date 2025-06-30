import { Clock, UserRound } from "lucide-react"

export default function ReservationStatusCard() {
  return (
    <div className="mb-[10px] flex h-[84px] w-full items-center bg-zinc-50">
      <div className="flex h-full w-[74px] flex-col items-center justify-center gap-[5px] *:text-zinc-600">
        <span className="text-[16px] font-semibold leading-5">Mon</span>
        <span className="text-2xl font-semibold leading-5">07</span>
      </div>
      <div className="h-[60px] w-[1px] bg-gray-200"></div>
      <div className="flex h-full w-full items-center pl-5">
        <div className="flex *:text-gray-600">
          <div className="flex flex-col gap-[3px] ">
            <div className="flex gap-2">
              <Clock className="mt-0.5 size-3 " />
              <span className=" text-[10px] font-normal">
                12:00AM - 11:59PM
              </span>
            </div>
            <div className="flex gap-2">
              <UserRound className="mt-0.5 size-3 " />
              <span className=" text-[10px] font-normal">
                12:00AM - 11:59PM
              </span>
            </div>
            <span className="mt-1 text-[12px] font-semibold leading-[14px] text-zinc-600">
              밤편지 합주
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
