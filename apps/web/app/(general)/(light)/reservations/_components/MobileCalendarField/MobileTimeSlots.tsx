"use client"

import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { getRentalPeopleLabel, isMyRental } from "@/lib/rental/people"
import { getRentalColor } from "../rentalColors"
import { useAuth } from "@/lib/providers/auth-provider"

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
  const { user } = useAuth()
  const dayStart = selectedDate.startOf("day")
  const dayEnd = dayStart.add(1, "day")
  // 고른 날에 걸쳐 있는 예약 — 전날부터 이어지거나 다음 날까지 가는 예약도 (주 보기와 같은 조건)
  const dayRentals = rentals
    .filter(
      (r) =>
        dayjs(r.startAt).isBefore(dayEnd) && dayjs(r.endAt).isAfter(dayStart)
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )

  /** 이 날 안에서의 시작 시와 끝(분) — 전날부터면 0시, 다음 날까지면 24:00 */
  const withinDay = (rental: RentalDetail) => {
    const start = dayjs(rental.startAt)
    const end = dayjs(rental.endAt)
    return {
      startHour: start.isBefore(dayStart) ? 0 : start.hour(),
      endMin: end.isAfter(dayEnd) ? 24 * 60 : end.diff(dayStart, "minute")
    }
  }

  /** Group rentals by the hour they START in (this day) */
  const rentalsByHour = new Map<number, RentalDetail[]>()
  for (const rental of dayRentals) {
    const hour = withinDay(rental).startHour
    const list = rentalsByHour.get(hour) ?? []
    list.push(rental)
    rentalsByHour.set(hour, list)
  }

  // 기본 09~22시, 예약 있으면 동적 확장
  const rentalHours = Array.from(rentalsByHour.keys())
  const startHour = Math.min(DEFAULT_START, ...rentalHours)
  const endHour = Math.max(DEFAULT_END, ...rentalHours)

  // 예약이 걸쳐 있는 시간대 (시작 시간 제외)는 스킵 대상 — 10:00~12:30이면 11·12시
  const occupiedHours = new Set<number>()
  for (const rental of dayRentals) {
    const { startHour: sH, endMin } = withinDay(rental)
    const lastHour = Math.ceil(endMin / 60) - 1
    for (let h = sH + 1; h <= lastHour; h++) occupiedHours.add(h)
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
                // 여러 날이면 날짜도 — 고른 날만 보면 언제 시작·끝나는지 모름
                const fmt = start.isSame(end, "day") ? "HH:mm" : "M/D HH:mm"
                const timeRange = `${start.format(fmt)} - ${end.format(fmt)}`
                const userLabel = getRentalPeopleLabel(rental)
                // 내 예약은 주 보기 블록과 같은 진한 색으로 채움
                const mine = isMyRental(rental, user?.id)
                const solid = getRentalColor(rental.id, true)
                const subText = mine ? "text-white/80" : "text-gray-500"

                return (
                  <div
                    key={rental.id}
                    className={`my-1 flex items-center border-b border-gray-50 px-1 py-3 transition-colors ${mine ? `rounded-md ${solid.bg} ${onRentalClick ? solid.hoverBg : ""}` : onRentalClick ? "hover:bg-gray-50" : ""} ${onRentalClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRentalClick?.(rental)}
                  >
                    {/* 고른 날짜의 목록이라 날짜는 생략 */}
                    <div className="flex flex-1 flex-col gap-0.5 pl-2">
                      <div className={`flex items-center gap-1.5 ${subText}`}>
                        <Clock size={11} />
                        <span className="text-[11px]">{timeRange}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${subText}`}>
                        <UserRound size={11} />
                        <span className="text-[11px]">{userLabel}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${mine ? "text-white" : "text-zinc-600"}`}
                      >
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
