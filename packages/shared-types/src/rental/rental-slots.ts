import { RENTAL_MINUTE_STEP } from "./rental-time"

/** 자정을 넘기는 예약을 고를 수 있게 칸 목록을 다음날 이 시각까지 이어 붙인다 */
export const NEXT_DAY_UNTIL_HOUR = 6

export type TimeSlot = { startAt: Date; endAt: Date; nextDay: boolean }
export type TimeRange = { startAt: Date; endAt: Date }
export type BusyRange = { id: number; startAt: Date; endAt: Date }

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000)

export function slotQueryRange(date: Date): { from: Date; to: Date } {
  const from = startOfDay(date)
  const to = startOfDay(addMinutes(from, 36 * 60))
  to.setHours(NEXT_DAY_UNTIL_HOUR)
  return { from, to }
}

export function buildDaySlots(date: Date): TimeSlot[] {
  const { from, to } = slotQueryRange(date)
  const nextDayStart = startOfDay(addMinutes(from, 36 * 60))
  const slots: TimeSlot[] = []
  for (let t = from; t < to; t = addMinutes(t, RENTAL_MINUTE_STEP)) {
    slots.push({
      startAt: t,
      endAt: addMinutes(t, RENTAL_MINUTE_STEP),
      nextDay: t >= nextDayStart
    })
  }
  return slots
}

/** 서버의 겹침 검사와 같은 기준 — 끝과 시작이 맞닿기만 하면 겹치지 않음 */
const overlaps = (a: TimeRange, b: TimeRange) =>
  a.startAt < b.endAt && a.endAt > b.startAt

export function rangeOverlapsBusy(
  range: TimeRange,
  busy: BusyRange[],
  excludeId?: number
): boolean {
  return busy.some((b) => b.id !== excludeId && overlaps(range, b))
}

export function busyFlags(
  slots: TimeSlot[],
  busy: BusyRange[],
  excludeId?: number
): boolean[] {
  return slots.map((slot) => rangeOverlapsBusy(slot, busy, excludeId))
}
