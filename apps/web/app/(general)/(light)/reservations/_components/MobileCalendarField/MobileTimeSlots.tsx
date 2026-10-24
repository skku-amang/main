"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { getRentalPeopleLabel } from "../rentalPeople"

interface MobileTimeSlotsProps {
  selectedDate: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
  /** 예약 없는 시간 줄 클릭 — 그 시각 정각 */
  onSlotClick?: (startAt: Dayjs) => void
}

const DEFAULT_START = 9
const DEFAULT_END = 22

export default function MobileTimeSlots({
  selectedDate,
  rentals,
  onRentalClick,
  onSlotClick
}: MobileTimeSlotsProps) {
  const selectedDay = selectedDate.format("YYYY-MM-DD")
  const dayRentals = rentals
    .filter((r) => dayjs(r.startAt).format("YYYY-MM-DD") === selectedDay)
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )

  /** Group rentals by the hour they START in */
  const rentalsByHour = new Map<number, RentalDetail[]>()
  for (const rental of dayRentals) {
    const hour = dayjs(rental.startAt).hour()
    const list = rentalsByHour.get(hour) ?? []
    list.push(rental)
    rentalsByHour.set(hour, list)
  }

  // 기본 09~22시, 예약 있으면 동적 확장
  const rentalHours = Array.from(rentalsByHour.keys())
  const startHour = Math.min(DEFAULT_START, ...rentalHours)
  const endHour = Math.max(DEFAULT_END, ...rentalHours)

  // 예약이 진행 중인 시간대 (시작 시간 제외, 종료 시간 이전)는 스킵 대상
  const occupiedHours = new Set<number>()
  for (const rental of dayRentals) {
    const sH = dayjs(rental.startAt).hour()
    const eH = dayjs(rental.endAt).hour()
    for (let h = sH + 1; h < eH; h++) occupiedHours.add(h)
  }

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => i + startHour
  ).filter((h) => !occupiedHours.has(h) || rentalsByHour.has(h))

  return (
    <div className="flex flex-col">
      {hours.map((hour) => {
        const hourRentals = rentalsByHour.get(hour)
        const hourLabel = `${String(hour).padStart(2, "0")}:00`
        if (onSlotClick && !hourRentals) {
          return (
            <button
              key={hour}
              type="button"
              aria-label={`${hourLabel}부터 예약하기`}
              className="flex min-h-[44px] w-full text-left transition-colors active:bg-primary/15"
              onClick={() =>
                onSlotClick(selectedDate.startOf("day").add(hour, "hour"))
              }
            >
              <span className="w-14 shrink-0 pt-3 text-sm font-medium text-zinc-500">
                {hourLabel}
              </span>
              <span className="flex-1 self-stretch border-t border-gray-100" />
            </button>
          )
        }
        return (
          <div key={hour} className="flex min-h-[44px]">
            {/* Hour label */}
            <div className="w-14 shrink-0 pt-3 text-sm font-medium text-zinc-500">
              {hourLabel}
            </div>

            {/* Separator + events */}
            <div className="flex flex-1 flex-col border-t border-gray-100 py-1">
              {hourRentals?.map((rental) => {
                const start = dayjs(rental.startAt)
                const end = dayjs(rental.endAt)
                const timeRange = `${start.format("HH:mm")} - ${end.format("HH:mm")}`
                const userLabel = getRentalPeopleLabel(rental)

                return (
                  <div
                    key={rental.id}
                    className={`my-1 flex items-center border-b border-gray-50 px-1 py-3 transition-colors ${onRentalClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                    onClick={() => onRentalClick?.(rental)}
                  >
                    {/* 고른 날짜의 목록이라 날짜는 생략 */}
                    <div className="flex flex-1 flex-col gap-0.5 pl-2">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={11} />
                        <span className="text-[11px]">{timeRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <UserRound size={11} />
                        <span className="text-[11px]">{userLabel}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-600">
                        {rental.title}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
