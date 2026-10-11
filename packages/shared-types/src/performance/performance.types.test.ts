import { describe, expect, it } from "vitest"
import { isPerformanceRecruiting } from "./performance.types"

describe("isPerformanceRecruiting", () => {
  const now = new Date("2026-10-11T12:00:00Z")

  it("종료 일시가 지나지 않았으면 모집 중", () => {
    expect(
      isPerformanceRecruiting({ endAt: new Date("2026-11-10T13:00:00Z") }, now)
    ).toBe(true)
  })

  it("종료 일시가 지났으면 마감", () => {
    expect(
      isPerformanceRecruiting({ endAt: new Date("2026-05-10T05:59:00Z") }, now)
    ).toBe(false)
  })

  it("종료 일시와 현재가 같으면 마감", () => {
    expect(isPerformanceRecruiting({ endAt: now }, now)).toBe(false)
  })

  it("종료 일시가 비어 있으면 모집 중", () => {
    expect(isPerformanceRecruiting({ endAt: null }, now)).toBe(true)
  })
})
