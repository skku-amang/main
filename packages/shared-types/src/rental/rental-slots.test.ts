import { describe, expect, it } from "vitest"
import {
  buildDaySlots,
  busyFlags,
  rangeOverlapsBusy,
  slotQueryRange
} from "./rental-slots"

const at = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m)
const DAY = at(26, 0)
const slots = buildDaySlots(DAY)
const trueIndexes = (flags: boolean[]) =>
  flags.flatMap((f, i) => (f ? [i] : []))

describe("buildDaySlots", () => {
  it("그날 48칸 + 다음날 새벽 12칸", () => {
    expect(slots).toHaveLength(60)
  })
  it("첫 칸은 그날 00:00~00:30", () => {
    expect(slots[0]).toEqual({
      startAt: at(26, 0),
      endAt: at(26, 0, 30),
      nextDay: false
    })
  })
  it("그날 마지막 칸은 23:30~다음날 00:00", () => {
    expect(slots[47]).toEqual({
      startAt: at(26, 23, 30),
      endAt: at(27, 0),
      nextDay: false
    })
  })
  it("49번째 칸부터 다음날", () => {
    expect(slots[48]).toEqual({
      startAt: at(27, 0),
      endAt: at(27, 0, 30),
      nextDay: true
    })
  })
  it("마지막 칸은 다음날 05:30~06:00", () => {
    expect(slots[59]).toEqual({
      startAt: at(27, 5, 30),
      endAt: at(27, 6),
      nextDay: true
    })
  })
  it("넘긴 날짜의 시각은 무시", () => {
    expect(buildDaySlots(at(26, 15, 42))).toEqual(slots)
  })
})

describe("slotQueryRange", () => {
  it("그날 00:00 ~ 다음날 06:00", () => {
    expect(slotQueryRange(at(26, 15, 42))).toEqual({
      from: at(26, 0),
      to: at(27, 6)
    })
  })
})

describe("busyFlags", () => {
  const busy = (startAt: Date, endAt: Date, id = 1) => [{ id, startAt, endAt }]

  it("19:00~20:00 예약은 19:00·19:30 칸만 막음", () => {
    expect(trueIndexes(busyFlags(slots, busy(at(26, 19), at(26, 20))))).toEqual(
      [38, 39]
    )
  })
  it("칸 일부만 겹쳐도 막음", () => {
    expect(
      trueIndexes(busyFlags(slots, busy(at(26, 19, 15), at(26, 19, 45))))
    ).toEqual([38, 39])
  })
  it("전날 밤부터 이어지는 예약은 그날 새벽 칸을 막음", () => {
    expect(trueIndexes(busyFlags(slots, busy(at(25, 23), at(26, 1))))).toEqual([
      0, 1
    ])
  })
  it("다음날 새벽 예약은 다음날 칸을 막음", () => {
    expect(trueIndexes(busyFlags(slots, busy(at(27, 1), at(27, 2))))).toEqual([
      50, 51
    ])
  })
  it("끝이 칸 시작과 맞닿으면 안 막음", () => {
    expect(busyFlags(slots, busy(at(26, 18), at(26, 19)))[38]).toBe(false)
  })
  it("수정 중인 자기 예약은 빼고 계산", () => {
    expect(
      trueIndexes(busyFlags(slots, busy(at(26, 19), at(26, 20), 7), 7))
    ).toEqual([])
  })
})

describe("rangeOverlapsBusy", () => {
  const busy = [{ id: 1, startAt: at(26, 19), endAt: at(26, 20) }]

  it("일부 겹치면 true", () => {
    expect(
      rangeOverlapsBusy(
        { startAt: at(26, 19, 30), endAt: at(26, 20, 30) },
        busy
      )
    ).toBe(true)
  })
  it("맞닿기만 하면 false", () => {
    expect(
      rangeOverlapsBusy({ startAt: at(26, 20), endAt: at(26, 21) }, busy)
    ).toBe(false)
  })
  it("자기 예약은 빼고 계산", () => {
    expect(
      rangeOverlapsBusy({ startAt: at(26, 19), endAt: at(26, 20) }, busy, 1)
    ).toBe(false)
  })
})
