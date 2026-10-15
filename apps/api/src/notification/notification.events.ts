import { NotificationContent } from "@repo/shared-types"

export const NOTIFICATION_EVENTS = {
  CREATED: "notification.created"
} as const

/**
 * 알림 row가 저장된 뒤 발행. 푸시 등 전달 채널이 구독한다.
 * type↔payload 상관관계를 잃지 않도록 둘을 묶은 NotificationContent로 든다.
 */
export class NotificationCreatedEvent {
  constructor(
    readonly recipientIds: number[],
    readonly content: NotificationContent
  ) {}
}
