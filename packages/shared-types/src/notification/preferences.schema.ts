import { NotificationType } from "@repo/database/enums"
import { z } from "zod"

const hourSchema = z.number().int().min(0).max(23)

/** 방해금지 시간대(KST 시). start > end면 자정을 넘는 구간, 같으면 꺼진 것과 같다 */
export const QuietHoursSchema = z.object({
  enabled: z.boolean(),
  start: hourSchema,
  end: hourSchema
})

/**
 * @description 알림 설정. 푸시만 제어하고 알림함에는 영향이 없다 (#708).
 */
export const NotificationPreferencesSchema = z.object({
  /** 푸시를 받지 않을 유형 */
  mutedTypes: z.array(z.nativeEnum(NotificationType)),
  quietHours: QuietHoursSchema
})

export const UpdateNotificationPreferencesSchema =
  NotificationPreferencesSchema.partial()

export type QuietHours = z.infer<typeof QuietHoursSchema>
export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>
export type UpdateNotificationPreferences = z.infer<
  typeof UpdateNotificationPreferencesSchema
>
