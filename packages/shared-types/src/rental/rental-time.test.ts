import { describe, expect, it } from "vitest"
import { formatDuration, nextFullHour } from "./rental-time"

describe("nextFullHour", () => {
  it("14:20 → 15:00", () => {
    expect(nextFullHour(new Date(2026, 10, 15, 14, 20, 33))).toEqual(
      new Date(2026, 10, 15, 15, 0, 0, 0)
    )
  })
  it("정각도 다음 정시", () => {
    expect(nextFullHour(new Date(2026, 10, 15, 14, 0, 0))).toEqual(
      new Date(2026, 10, 15, 15, 0, 0, 0)
    )
  })
  it("자정을 넘기면 다음 날 00:00", () => {
    expect(nextFullHour(new Date(2026, 10, 15, 23, 30))).toEqual(
      new Date(2026, 10, 16, 0, 0, 0, 0)
    )
  })
})

describe("formatDuration", () => {
  it("시간만", () => {
    expect(formatDuration(19 * 60, 21 * 60)).toBe("2시간")
  })
  it("시간과 분", () => {
    expect(formatDuration(19 * 60, 20 * 60 + 30)).toBe("1시간 30분")
  })
  it("분만", () => {
    expect(formatDuration(19 * 60, 19 * 60 + 45)).toBe("45분")
  })
  it("같으면 null", () => {
    expect(formatDuration(19 * 60, 19 * 60)).toBeNull()
  })
  it("종료가 앞이면 null", () => {
    expect(formatDuration(21 * 60, 19 * 60)).toBeNull()
  })
  it("하루 이상이면 일 단위", () => {
    expect(formatDuration(0, 24 * 60)).toBe("1일")
  })
  it("일과 시간", () => {
    expect(formatDuration(0, 27 * 60)).toBe("1일 3시간")
  })
  it("일·시간·분", () => {
    expect(formatDuration(0, 2 * 24 * 60 + 90)).toBe("2일 1시간 30분")
  })
})
