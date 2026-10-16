import { kstDayStart, kstHour } from "./kst"

describe("kstDayStart", () => {
  it("UTC로는 전날 오후여도 한국 날짜 기준 자정을 돌려준다", () => {
    // 2026-10-16 23:50 KST
    const now = new Date("2026-10-16T14:50:00Z")

    expect(kstDayStart(now).toISOString()).toBe("2026-10-15T15:00:00.000Z")
    expect(kstDayStart(now, 1).toISOString()).toBe("2026-10-16T15:00:00.000Z")
    expect(kstDayStart(now, 2).toISOString()).toBe("2026-10-17T15:00:00.000Z")
  })

  it("한국 자정 직후도 같은 날로 본다", () => {
    // 2026-10-17 00:10 KST
    const now = new Date("2026-10-16T15:10:00Z")

    expect(kstDayStart(now).toISOString()).toBe("2026-10-16T15:00:00.000Z")
  })
})

describe("kstHour", () => {
  it("UTC 시각을 한국 시로 바꾼다", () => {
    expect(kstHour(new Date("2026-10-16T14:50:00Z"))).toBe(23)
    expect(kstHour(new Date("2026-10-16T15:00:00Z"))).toBe(0)
    expect(kstHour(new Date("2026-10-16T23:59:00Z"))).toBe(8)
    expect(kstHour(new Date("2026-10-17T00:00:00Z"))).toBe(9)
  })
})
