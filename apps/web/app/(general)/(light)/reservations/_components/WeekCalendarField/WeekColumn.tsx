import dayjs, { Dayjs } from "dayjs"
import { RentalDetail } from "@repo/shared-types"
import { getRentalColor } from "../rentalColors"
import { getRentalPeopleLabel, isMyRental } from "@/lib/rental/people"
import { useAuth } from "@/lib/providers/auth-provider"

export type DragMode = "move" | "resize"

interface WeekColumnProp {
  currentMonday: Dayjs
  offset: number
  nowTopPx: number
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
  /** 빈 칸 클릭 — 누른 1시간 칸의 정각 */
  onSlotClick?: (startAt: Dayjs) => void
  now: Date | null
  startHour: number
  slotCount: number
  compact: boolean
  canDrag: (rental: RentalDetail) => boolean
  draggingId: number | null
  onBlockPointerDown: (
    e: React.PointerEvent,
    rental: RentalDetail,
    mode: DragMode
  ) => void
  onBlockTouchMove: (e: React.TouchEvent) => void
  onBlockTouchEnd: (e: React.TouchEvent) => void
}

const PX_PER_HOUR = 42
const HEADER_PX = 42

export default function WeekColumn({
  currentMonday,
  nowTopPx,
  offset,
  rentals,
  onRentalClick,
  onSlotClick,
  now,
  startHour,
  slotCount,
  compact,
  canDrag,
  draggingId,
  onBlockPointerDown,
  onBlockTouchMove,
  onBlockTouchEnd
}: WeekColumnProp) {
  const { user } = useAuth()
  const date = currentMonday.add(offset, "day")
  const dayName = date.format("ddd")
  const dayNumber = date.format("D")
  const isToday = date.isSame(new Date(), "day")

  // 해당 날짜에 걸치는 모든 이벤트 (당일 시작 + 전날 시작~오늘 종료)
  const dayRentals = rentals.filter((r) => {
    const s = dayjs(r.startAt)
    const e = dayjs(r.endAt)
    return (
      s.isSame(date, "day") ||
      (s.isBefore(date, "day") && e.isAfter(date.startOf("day")))
    )
  })

  return (
    <div className="w-[14.28%] relative overflow-hidden border-x-[1.5px] border-gray-100">
      {/* 헤더: 요일 + 날짜 */}
      <div
        className={`w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center ${compact ? "flex-col text-[10px] leading-none gap-0.5" : "gap-1"}`}
      >
        <span>{dayName}</span>
        {isToday ? (
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white">
            {dayNumber}
          </div>
        ) : (
          <span>{dayNumber}</span>
        )}
      </div>

      {/* 시간 구간 */}
      {Array.from({ length: slotCount }).map((_, i) => {
        const slotStart = date.startOf("day").add(startHour + i, "hour")
        const className =
          "block w-full h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
        if (!onSlotClick || !now || !slotStart.add(1, "hour").isAfter(now))
          return <div key={i} className={className}></div>
        // 마우스·터치 지름길 — 칸이 100개 가까이라 Tab 순서에선 빼고, 키보드는 예약하기 버튼으로
        return (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            aria-hidden
            className={`${className} transition-colors hover:bg-gray-50 active:bg-primary/15`}
            onClick={() => onSlotClick(slotStart)}
          />
        )
      })}

      {/* 예약 이벤트 블록 */}
      {dayRentals.map((rental) => {
        const start = dayjs(rental.startAt)
        const end = dayjs(rental.endAt)
        const totalMin = slotCount * 60
        const rawStartMin = start.isSame(date, "day")
          ? (start.hour() - startHour) * 60 + start.minute()
          : 0
        const startMin = Math.max(0, rawStartMin)
        const rawEndMin = end.isSame(date, "day")
          ? (end.hour() - startHour) * 60 + end.minute()
          : totalMin
        const endMin = Math.max(0, Math.min(totalMin, rawEndMin))
        if (endMin <= startMin) return null
        const topPx = HEADER_PX + (startMin * PX_PER_HOUR) / 60
        const heightPx = ((endMin - startMin) * PX_PER_HOUR) / 60
        const color = getRentalColor(rental.id)
        const draggable = canDrag(rental)
        const isDragging = draggingId === rental.id
        const peopleLabel = getRentalPeopleLabel(rental)
        const mine = isMyRental(rental, user?.id)

        return (
          <div
            key={rental.id}
            className={`absolute left-0.5 right-0.5 ${color.bg} border-l-2 ${color.border} rounded-r-sm ${mine ? "ring-2 ring-inset ring-primary" : ""} ${compact ? "px-0.5" : "px-1"} overflow-hidden ${color.hoverBg} ${draggable ? "cursor-grab select-none [-webkit-touch-callout:none]" : "cursor-pointer"} ${isDragging ? "z-10 opacity-80 shadow-lg ring-2 ring-primary cursor-grabbing" : "transition-colors"}`}
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            title={`${rental.title}\n${start.format("HH:mm")} - ${end.format("HH:mm")}`}
            onClick={() => onRentalClick?.(rental)}
            onPointerDown={(e) => onBlockPointerDown(e, rental, "move")}
            onTouchMove={onBlockTouchMove}
            onTouchEnd={onBlockTouchEnd}
          >
            {/* PC·휴대폰 같은 내용 — 폭에 따라 글자 크기만 다름 */}
            <p
              className={`font-semibold leading-tight break-all ${color.text} ${compact ? "text-[10px]" : "text-xs"}`}
            >
              {rental.title}
            </p>
            {peopleLabel && (
              <p
                // 이름 중간에서 끊지 않고 '외 N명' 앞에서 줄바꿈, 이름이 칸보다 길 때만 글자 단위
                className={`leading-tight break-keep [overflow-wrap:anywhere] ${color.text} opacity-70 ${compact ? "text-[9px]" : "text-[10px]"}`}
              >
                {peopleLabel}
              </p>
            )}
            {draggable && !compact && (
              <div
                className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                onPointerDown={(e) => {
                  e.stopPropagation()
                  onBlockPointerDown(e, rental, "resize")
                }}
              />
            )}
          </div>
        )
      })}

      {/* 오늘일 경우 현재시간 라인 */}
      {isToday && (
        <div
          className="absolute h-[2px] -translate-y-1/2 w-full bg-destructive"
          style={{ top: `${nowTopPx}px` }}
        >
          <div className="w-full relative">
            <div className="absolute h-5 w-[1.5px] -translate-y-1/2 -left-[1px] bg-destructive" />
            <div className="absolute h-5 w-[1.5px] -translate-y-1/2 -right-[1px] bg-destructive" />
          </div>
        </div>
      )}
    </div>
  )
}
