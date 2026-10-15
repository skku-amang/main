import { NotificationType } from "@repo/database"
import { NotificationPayload } from "@repo/shared-types"

export const NOTIFICATION_EVENTS = {
  CREATED: "notification.created"
} as const

/** 알림 row가 저장된 뒤 발행. 푸시 등 전달 채널이 구독한다. */
export class NotificationCreatedEvent<
  T extends NotificationType = NotificationType
> {
  constructor(
    readonly recipientIds: number[],
    readonly type: T,
    readonly payload: NotificationPayload<T>
  ) {}
}
