import { NotificationType, SessionName } from "@repo/database/enums"
import { z } from "zod"

const idSchema = z.number().int().positive()

export const TeamMemberChangePayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string(),
  changeType: z.enum(["ADDED", "REMOVED"]),
  memberName: z.string(),
  sessionNames: z.array(z.nativeEnum(SessionName))
})

export const TeamAttributeChangePayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string(),
  changedFields: z.array(z.string())
})

export const TeamCreatedPayloadSchema = z.object({
  performanceId: idSchema,
  performanceName: z.string(),
  teamId: idSchema,
  teamName: z.string()
})

export const PerformanceCreatedPayloadSchema = z.object({
  performanceId: idSchema,
  performanceName: z.string()
})

const notificationBase = {
  id: idSchema,
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date()
}

/**
 * @description 알림 1건. `type`으로 payload 구조가 결정된다 (discriminated union).
 * 문구는 저장하지 않으며 클라이언트가 type + payload로 렌더한다.
 */
export const NotificationItemSchema = z.discriminatedUnion("type", [
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_MEMBER_CHANGE),
    payload: TeamMemberChangePayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_ATTRIBUTE_CHANGE),
    payload: TeamAttributeChangePayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_CREATED),
    payload: TeamCreatedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.PERFORMANCE_CREATED),
    payload: PerformanceCreatedPayloadSchema
  })
])

export type NotificationItem = z.infer<typeof NotificationItemSchema>

export type NotificationPayload<T extends NotificationType> = Extract<
  NotificationItem,
  { type: T }
>["payload"]

/**
 * @description 알림 목록 조회 쿼리. cursor는 마지막으로 받은 알림 id (그보다 작은 id를 반환).
 */
export const GetNotificationsQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
})

export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>
