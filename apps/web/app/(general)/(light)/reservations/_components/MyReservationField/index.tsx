import ReservationCard from "./ReservationCard"

export default function MyReservationField() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const currentMonth = monthNames[new Date().getMonth()]
  return (
    <div className="w-full bg-white h-full py-7 px-5 rounded-[12px]">
      <div className="justify-start mb-4 text-Zinc-700 text-xl font-semibold">
        나의 예약현황
      </div>
      <span className="justify-center text-gray-600 text-base font-semibold leading-none">
        {currentMonth}
      </span>
      <div className="w-full flex flex-col pt-3 gap-[10px]">
        {/* TODO: API 연결 시, map 함수 도입 */}
        <ReservationCard />
      </div>
    </div>
  )
}
