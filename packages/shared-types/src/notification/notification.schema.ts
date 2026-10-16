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

export const PerformanceUpdatedPayloadSchema = z.object({
  performanceId: idSchema,
  performanceName: z.string(),
  changedFields: z.array(z.string())
})

export const TeamDeletedPayloadSchema = z.object({
  performanceId: idSchema,
  performanceName: z.string(),
  teamName: z.string()
})

export const TeamLeaderChangedPayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string(),
  leaderName: z.string(),
  /** true = 받는 사람이 새 팀장 */
  assigned: z.boolean()
})

export const TeamFilledPayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string()
})

export const UserSignedUpPayloadSchema = z.object({
  userId: idSchema,
  userName: z.string(),
  generationOrder: z.number().int()
})

export const UserApprovedPayloadSchema = z.object({
  userName: z.string()
})

export const BookmarkedTeamSpotOpenedPayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string(),
  sessionNames: z.array(z.nativeEnum(SessionName))
})

export const RoomReservationSoonPayloadSchema = z.object({
  rentalId: idSchema,
  title: z.string(),
  startAt: z.coerce.date()
})

export const EquipmentReturnDuePayloadSchema = z.object({
  rentalId: idSchema,
  equipmentId: idSchema,
  equipmentName: z.string(),
  endAt: z.coerce.date()
})

export const TeamRecruitmentDeadlinePayloadSchema = z.object({
  teamId: idSchema,
  performanceId: idSchema,
  teamName: z.string(),
  /** 세션별 빈자리 수. 알림 시점 스냅샷 */
  openSlots: z.array(
    z.object({
      sessionName: z.nativeEnum(SessionName),
      count: z.number().int().positive()
    })
  )
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
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.PERFORMANCE_UPDATED),
    payload: PerformanceUpdatedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_DELETED),
    payload: TeamDeletedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_LEADER_CHANGED),
    payload: TeamLeaderChangedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_FILLED),
    payload: TeamFilledPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.USER_SIGNED_UP),
    payload: UserSignedUpPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.USER_APPROVED),
    payload: UserApprovedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.BOOKMARKED_TEAM_SPOT_OPENED),
    payload: BookmarkedTeamSpotOpenedPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.TEAM_RECRUITMENT_DEADLINE),
    payload: TeamRecruitmentDeadlinePayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.ROOM_RESERVATION_SOON),
    payload: RoomReservationSoonPayloadSchema
  }),
  z.object({
    ...notificationBase,
    type: z.literal(NotificationType.EQUIPMENT_RETURN_DUE),
    payload: EquipmentReturnDuePayloadSchema
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
