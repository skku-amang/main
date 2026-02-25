export default function MobileReservationStatusCard() {
  const START_HOUR = 7 // 캘린더 시작 시간 (07:00)
  const TOTAL_HOURS = 15 // 표시할 총 시간 슬롯 수
  const HOURS_IN_CLOCK = 12 // 12시간제 시계

  return (
    <div className="flex w-full flex-col pt-5">
      {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
        const hour24 = i + START_HOUR
        const hour12 = hour24 % HOURS_IN_CLOCK || HOURS_IN_CLOCK

        return (
          <div
            key={i}
            className="min-w-16 w-1/5 h-28 flex justify-center -translate-x-1 font-medium text-[18px] pt-3 text-neutral-700"
          >
            {`${hour12}:00`}
          </div>
        )
      })}
    </div>
  )
}
