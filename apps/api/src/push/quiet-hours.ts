import { NotificationType } from "@repo/database"
import { kstHour } from "../common/kst"

/** 방해금지 시간대(KST, 자정을 넘는 구간). 전역 기본값 — 사용자별 설정은 후속(#708과 함께) */
export const QUIET_HOURS = { start: 23, end: 8 } as const

/** 지금 봐야 의미 있는 알림은 방해금지를 무시한다 — 08:00 예약의 07:00 알림이 08:00에 오면 무용 */
export const QUIET_HOURS_BYPASS: ReadonlySet<NotificationType> = new Set([
  NotificationType.ROOM_RESERVATION_SOON
])

export function isQuietHours(now: Date): boolean {
  const hour = kstHour(now)
  return hour >= QUIET_HOURS.start || hour < QUIET_HOURS.end
}
