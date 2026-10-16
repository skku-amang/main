const HOUR = 3_600_000
const DAY = 24 * HOUR
const KST_OFFSET = 9 * HOUR

/**
 * `now`가 속한 한국 날짜의 자정을 UTC 인스턴트로. `dayOffset`으로 내일(1)·모레(2) 이동.
 * 서버는 UTC로 돌지만 "내일 마감" 같은 날짜 경계는 한국 기준이어야 한다. KST는 DST가 없어 산술로 충분
 */
export function kstDayStart(now: Date, dayOffset = 0): Date {
  const shifted = now.getTime() + KST_OFFSET
  const dayStart = Math.floor(shifted / DAY) * DAY - KST_OFFSET
  return new Date(dayStart + dayOffset * DAY)
}
