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

/** 칸 인덱스(양끝 포함). awaitingEnd면 시작만 고른 상태 */
export type SlotSelection = {
  start: number
  end: number
  awaitingEnd: boolean
} | null
export type SlotContext = { slots: TimeSlot[]; busy: boolean[]; now: Date }

const canStart = (i: number, { slots, busy, now }: SlotContext) =>
  !slots[i]!.nextDay && !busy[i] && slots[i]!.startAt >= now

/** from부터 to까지(양끝 포함) 찬 칸 없이 이어지는지 */
const reachable = (from: number, to: number, busy: boolean[]) =>
  from <= to && !busy.slice(from, to + 1).some(Boolean)

export function selectSlot(
  sel: SlotSelection,
  index: number,
  ctx: SlotContext
): SlotSelection {
  if (sel?.awaitingEnd) {
    if (reachable(sel.start, index, ctx.busy))
      return { start: sel.start, end: index, awaitingEnd: false }
    if (index < sel.start && canStart(index, ctx))
      return { start: index, end: index, awaitingEnd: true }
    return sel
  }
  if (canStart(index, ctx))
    return { start: index, end: index, awaitingEnd: true }
  // 다음날 칸은 시작이 될 수 없으니, 다 고른 상태라면 끝만 늘린다
  if (sel && ctx.slots[index]!.nextDay && reachable(sel.start, index, ctx.busy))
    return { start: sel.start, end: index, awaitingEnd: false }
  return sel
}

export function tappableSlots(sel: SlotSelection, ctx: SlotContext): boolean[] {
  return ctx.slots.map((_, i) => selectSlot(sel, i, ctx) !== sel)
}

export function selectionRange(
  sel: NonNullable<SlotSelection>,
  slots: TimeSlot[]
): TimeRange {
  return { startAt: slots[sel.start]!.startAt, endAt: slots[sel.end]!.endAt }
}

export function selectionFromRange(
  range: TimeRange,
  slots: TimeSlot[]
): SlotSelection {
  const start = slots.findIndex(
    (s) => !s.nextDay && s.startAt.getTime() === range.startAt.getTime()
  )
  const end = slots.findIndex(
    (s) => s.endAt.getTime() === range.endAt.getTime()
  )
  if (start < 0 || end < start) return null
  return { start, end, awaitingEnd: false }
}

export function moveRangeToDate(range: TimeRange, date: Date): TimeRange {
  const startAt = new Date(date)
  startAt.setHours(
    range.startAt.getHours(),
    range.startAt.getMinutes(),
    range.startAt.getSeconds(),
    range.startAt.getMilliseconds()
  )
  const length = range.endAt.getTime() - range.startAt.getTime()
  return { startAt, endAt: new Date(startAt.getTime() + length) }
}

export type EditPhase = "upcoming" | "ongoing" | "ended"

export function rentalEditPhase(range: TimeRange, now: Date): EditPhase {
  if (range.startAt > now) return "upcoming"
  return range.endAt > now ? "ongoing" : "ended"
}

/**
 * 진행 중인 예약 수정 — 시작은 고정, 끝으로 고를 수 있는 칸.
 * 칸 단위가 아니라 고정 시작부터의 실제 시간으로 겹침을 본다 (시작 전에 끝난 앞 예약은 막지 않음)
 */
export function endOnlyTappable(
  fixedStart: Date,
  slots: TimeSlot[],
  now: Date,
  busy: BusyRange[],
  excludeId?: number
): boolean[] {
  const floor = now > fixedStart ? now : fixedStart
  return slots.map(
    (s) =>
      s.endAt > floor &&
      !rangeOverlapsBusy(
        { startAt: fixedStart, endAt: s.endAt },
        busy,
        excludeId
      )
  )
}
