import { isQuietHours } from "./quiet-hours"

describe("isQuietHours", () => {
  it.each([
    ["22:59 KST", "2026-10-16T13:59:00Z", false],
    ["23:00 KST", "2026-10-16T14:00:00Z", true],
    ["00:30 KST", "2026-10-16T15:30:00Z", true],
    ["07:59 KST", "2026-10-16T22:59:00Z", true],
    ["08:00 KST", "2026-10-16T23:00:00Z", false],
    ["12:00 KST", "2026-10-16T03:00:00Z", false]
  ])("%s → %s", (_label, iso, expected) => {
    expect(isQuietHours(new Date(iso))).toBe(expected)
  })
})
