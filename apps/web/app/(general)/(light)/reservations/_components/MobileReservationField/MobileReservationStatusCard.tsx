export default function MobileReservationStatusCard() {
  return (
    <div className="flex w-full pt-5">
      <div className="flex w-full flex-col">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            className="min-w-16 w-1/5 h-28 flex justify-center -translate-x-1 font-medium text-[18px] pt-3 text-neutral-700"
            key={i}
          >
            {(i + 7) % 12 === 0 ? "12:00" : ((i + 7) % 12) + ":00"}
          </div>
        ))}
      </div>
    </div>
  )
}
