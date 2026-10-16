import { NotificationType } from "@repo/database"
import type { QuietHours } from "@repo/shared-types"
import { kstHour } from "../common/kst"

/** 지금 봐야 의미 있는 알림은 방해금지를 무시한다 — 08:00 예약의 07:00 알림이 08:00에 오면 무용 */
export const QUIET_HOURS_BYPASS: ReadonlySet<NotificationType> = new Set([
  NotificationType.ROOM_RESERVATION_SOON
])

/** 사용자 설정 기준 방해금지 여부(KST). start > end면 자정을 넘는 구간, 같으면 꺼진 것과 같다 */
export function isQuietHours(
  now: Date,
  { enabled, start, end }: QuietHours
): boolean {
  if (!enabled || start === end) return false
  const hour = kstHour(now)
  return start > end ? hour >= start || hour < end : hour >= start && hour < end
}
