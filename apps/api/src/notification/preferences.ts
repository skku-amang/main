import { Prisma } from "@repo/database"
import { NotificationPreferences } from "@repo/shared-types"

/** User row의 알림 설정 컬럼 */
export const preferencesSelect = {
  id: true,
  mutedNotificationTypes: true,
  quietHoursEnabled: true,
  quietHoursStart: true,
  quietHoursEnd: true
} satisfies Prisma.UserSelect

export type PreferencesRow = Prisma.UserGetPayload<{
  select: typeof preferencesSelect
}>

export function toPreferences(user: PreferencesRow): NotificationPreferences {
  return {
    mutedTypes: user.mutedNotificationTypes,
    quietHours: {
      enabled: user.quietHoursEnabled,
      start: user.quietHoursStart,
      end: user.quietHoursEnd
    }
  }
}
