import { isQuietHours } from "./quiet-hours"

const DEFAULT = { enabled: true, start: 23, end: 8 }

describe("isQuietHours", () => {
  it.each([
    ["22:59 KST", "2026-10-16T13:59:00Z", false],
    ["23:00 KST", "2026-10-16T14:00:00Z", true],
    ["00:30 KST", "2026-10-16T15:30:00Z", true],
    ["07:59 KST", "2026-10-16T22:59:00Z", true],
    ["08:00 KST", "2026-10-16T23:00:00Z", false],
    ["12:00 KST", "2026-10-16T03:00:00Z", false]
  ])("기본 23–08: %s → %s", (_label, iso, expected) => {
    expect(isQuietHours(new Date(iso), DEFAULT)).toBe(expected)
  })

  it("꺼 두면 한밤중에도 방해금지가 아니다", () => {
    expect(
      isQuietHours(new Date("2026-10-16T15:30:00Z"), {
        ...DEFAULT,
        enabled: false
      })
    ).toBe(false)
  })

  it("자정을 넘지 않는 구간(13–15)도 된다", () => {
    const afternoon = { enabled: true, start: 13, end: 15 }
    expect(isQuietHours(new Date("2026-10-16T04:30:00Z"), afternoon)).toBe(true) // 13:30
    expect(isQuietHours(new Date("2026-10-16T06:00:00Z"), afternoon)).toBe(
      false
    ) // 15:00
  })

  it("시작과 끝이 같으면 꺼진 것과 같다", () => {
    expect(
      isQuietHours(new Date("2026-10-16T15:30:00Z"), {
        enabled: true,
        start: 0,
        end: 0
      })
    ).toBe(false)
  })
})
