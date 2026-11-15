import { describe, expect, it } from "vitest"
import { formatDuration, minuteOptions, nextFullHour } from "./rental-time"

describe("minuteOptions", () => {
  it("기본은 15분 단위", () => {
    expect(minuteOptions()).toEqual([0, 15, 30, 45])
  })
  it("15의 배수는 그대로", () => {
    expect(minuteOptions(30)).toEqual([0, 15, 30, 45])
  })
  it("15분 단위가 아닌 값은 끼워 넣음", () => {
    expect(minuteOptions(2)).toEqual([0, 2, 15, 30, 45])
  })
  it("끝쪽 값도 정렬", () => {
    expect(minuteOptions(47)).toEqual([0, 15, 30, 45, 47])
  })
})

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
})
