import { kstHour } from "../common/kst"

/** 방해금지 시간대(KST, 자정을 넘는 구간). 전역 기본값 — 사용자별 설정은 후속(#708과 함께) */
export const QUIET_HOURS = { start: 23, end: 8 } as const

export function isQuietHours(now: Date): boolean {
  const hour = kstHour(now)
  return hour >= QUIET_HOURS.start || hour < QUIET_HOURS.end
}
