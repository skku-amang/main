import { describe, expect, it } from "vitest"
import {
  buildDaySlots,
  busyFlags,
  endOnlyTappable,
  moveRangeToDate,
  rangeOverlapsBusy,
  rentalEditPhase,
  selectSlot,
  selectionFromRange,
  selectionRange,
  slotQueryRange,
  tappableSlots
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

describe("누르기 규칙", () => {
  // 지금 26일 15:10, 19:00~20:00(38·39번 칸)이 찬 상태
  const ctx = {
    slots,
    busy: busyFlags(slots, [{ id: 1, startAt: at(26, 19), endAt: at(26, 20) }]),
    now: at(26, 15, 10)
  }

  describe("tappableSlots", () => {
    const tappable = tappableSlots(null, ctx)
    it("이미 시작 시각이 지난 칸은 못 누름", () => {
      expect(tappable[30]).toBe(false)
    })
    it("앞으로 올 빈 칸은 누름", () => {
      expect(tappable[31]).toBe(true)
    })
    it("찬 칸은 못 누름", () => {
      expect(tappable[38]).toBe(false)
    })
    it("아무것도 안 골랐으면 다음날 칸은 못 누름", () => {
      expect(tappable[48]).toBe(false)
    })
  })

  describe("selectSlot", () => {
    it("처음 누른 칸이 시작", () => {
      expect(selectSlot(null, 42, ctx)).toEqual({
        start: 42,
        end: 42,
        awaitingEnd: true
      })
    })
    it("시작 뒤 칸을 누르면 그 칸까지 끝", () => {
      const sel = selectSlot(selectSlot(null, 42, ctx), 45, ctx)
      expect(sel).toEqual({ start: 42, end: 45, awaitingEnd: false })
      expect(selectionRange(sel!, slots)).toEqual({
        startAt: at(26, 21),
        endAt: at(26, 23)
      })
    })
    it("시작 칸을 한 번 더 누르면 30분짜리로 끝", () => {
      expect(
        selectSlot({ start: 42, end: 42, awaitingEnd: true }, 42, ctx)
      ).toEqual({ start: 42, end: 42, awaitingEnd: false })
    })
    it("시작 뒤 찬 칸 너머는 끝으로 못 고름", () => {
      const sel = { start: 34, end: 34, awaitingEnd: true }
      expect(selectSlot(sel, 40, ctx)).toEqual(sel)
      const tappable = tappableSlots(sel, ctx)
      expect(tappable[40]).toBe(false)
      expect(tappable[37]).toBe(true)
    })
    it("시작보다 앞 칸을 누르면 새 시작", () => {
      expect(
        selectSlot({ start: 42, end: 42, awaitingEnd: true }, 40, ctx)
      ).toEqual({ start: 40, end: 40, awaitingEnd: true })
    })
    it("다 고른 뒤 다음날 칸을 누르면 끝만 거기까지", () => {
      const sel = selectSlot(
        { start: 42, end: 45, awaitingEnd: false },
        49,
        ctx
      )
      expect(sel).toEqual({ start: 42, end: 49, awaitingEnd: false })
      expect(selectionRange(sel!, slots).endAt).toEqual(at(27, 1))
    })
    it("다 고른 뒤라도 사이에 찬 칸이 있으면 다음날 칸 못 누름", () => {
      const sel = { start: 34, end: 36, awaitingEnd: false }
      expect(selectSlot(sel, 49, ctx)).toEqual(sel)
    })
    it("다 고른 뒤 그날 칸을 누르면 새 시작", () => {
      expect(
        selectSlot({ start: 42, end: 45, awaitingEnd: false }, 31, ctx)
      ).toEqual({ start: 31, end: 31, awaitingEnd: true })
    })
  })
})

describe("selectionFromRange", () => {
  it("칸 경계에 맞으면 그 선택", () => {
    expect(
      selectionFromRange({ startAt: at(26, 21), endAt: at(26, 23) }, slots)
    ).toEqual({ start: 42, end: 45, awaitingEnd: false })
  })
  it("30분 단위가 아니면 null", () => {
    expect(
      selectionFromRange(
        { startAt: at(26, 14, 15), endAt: at(26, 15, 15) },
        slots
      )
    ).toBeNull()
  })
  it("다음날 새벽에 시작하면 null", () => {
    expect(
      selectionFromRange({ startAt: at(27, 1), endAt: at(27, 2) }, slots)
    ).toBeNull()
  })
  it("자정을 넘겨도 다음날 06시 안이면 그 선택", () => {
    expect(
      selectionFromRange({ startAt: at(26, 23), endAt: at(27, 1) }, slots)
    ).toEqual({ start: 46, end: 49, awaitingEnd: false })
  })
})

describe("moveRangeToDate", () => {
  it("시각과 길이를 유지한 채 날짜만 옮김", () => {
    expect(
      moveRangeToDate({ startAt: at(26, 23), endAt: at(27, 1) }, at(28, 9))
    ).toEqual({ startAt: at(28, 23), endAt: at(29, 1) })
  })
})

describe("rentalEditPhase", () => {
  const now = at(26, 15, 10)
  it("시작 전", () => {
    expect(
      rentalEditPhase({ startAt: at(26, 16), endAt: at(26, 17) }, now)
    ).toBe("upcoming")
  })
  it("진행 중", () => {
    expect(
      rentalEditPhase({ startAt: at(26, 15), endAt: at(26, 16) }, now)
    ).toBe("ongoing")
  })
  it("끝이 지금이면 끝남", () => {
    expect(
      rentalEditPhase({ startAt: at(26, 14), endAt: at(26, 15, 10) }, now)
    ).toBe("ended")
  })
})

describe("endOnlyTappable", () => {
  const now = at(26, 15, 10)
  const busy = [{ id: 1, startAt: at(26, 19), endAt: at(26, 20) }]
  const tappable = endOnlyTappable(at(26, 14, 15), slots, now, busy)
  it("끝이 지금보다 앞인 칸은 못 누름", () => {
    expect(tappable[28]).toBe(false)
  })
  it("지금 걸쳐 있는 칸은 끝으로 고름", () => {
    expect(tappable[30]).toBe(true)
  })
  it("찬 칸 직전까지 고름", () => {
    expect(tappable[37]).toBe(true)
  })
  it("찬 칸과 그 너머는 못 고름", () => {
    expect(tappable[38]).toBe(false)
    expect(tappable[40]).toBe(false)
  })
  it("고정 시작 전에 끝나는 앞 예약은 같은 칸에 있어도 막지 않음", () => {
    const before = [{ id: 2, startAt: at(26, 14), endAt: at(26, 14, 15) }]
    const t = endOnlyTappable(at(26, 14, 15), slots, at(26, 14, 20), before)
    expect(t[28]).toBe(true)
    expect(t[31]).toBe(true)
  })
  it("수정 중인 자기 예약은 빼고 계산", () => {
    const own = [{ id: 7, startAt: at(26, 14, 15), endAt: at(26, 16) }]
    expect(endOnlyTappable(at(26, 14, 15), slots, now, own, 7)[33]).toBe(true)
  })
})
