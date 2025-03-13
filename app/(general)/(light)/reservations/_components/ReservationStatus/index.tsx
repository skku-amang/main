import ReservationStatusCard from "@/app/(general)/(light)/reservations/_components/ReservationStatus/ReservationStatusCard"

export default function ReservationStatus() {
  return (
    <div className="flex h-[740px] w-72 flex-col rounded-xl bg-white px-5 py-7">
      <span className="mb-[18px] text-[22px] font-semibold text-zinc-700">
        나의 예약현황
      </span>

      <ReservationStatusCard />
      <ReservationStatusCard />
    </div>
  )
}
