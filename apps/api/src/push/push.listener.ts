import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { formatNotification } from "@repo/shared-types"
import {
  NOTIFICATION_EVENTS,
  NotificationCreatedEvent
} from "../notification/notification.events"
import { PrismaService } from "../prisma/prisma.service"
import { PushSender } from "./push.sender"
import { QUIET_HOURS_BYPASS, isQuietHours } from "./quiet-hours"

/**
 * 저장된 알림(notification.created)에서 파생된 푸시 발송. 알림함이 SSOT이고
 * 푸시는 best-effort라 실패는 로깅만 한다 (ADR-0003 원칙1).
 * 방해금지 시간대엔 보내지 않고 pushedAt을 비워 둔다 — 크론이 아침에 몰아서 보낸다 (PushDeferredService).
 */
@Injectable()
export class PushListener {
  private readonly logger = new Logger(PushListener.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: PushSender
  ) {}

  @OnEvent(NOTIFICATION_EVENTS.CREATED)
  async onNotificationCreated(event: NotificationCreatedEvent) {
    const now = new Date()
    if (isQuietHours(now) && !QUIET_HOURS_BYPASS.has(event.content.type)) return

    try {
      // 보내기 전에 처리됨으로 찍는다(claim) — flush와 겹쳐도 같은 row가 두 번 나가지 않는다. 발송 실패는 재시도 없음
      const { count } = await this.prisma.notification.updateMany({
        where: { id: { in: event.notificationIds }, pushedAt: null },
        data: { pushedAt: now }
      })
      if (count === 0) return

      await this.sender.sendToUsers(
        event.recipientIds,
        formatNotification(event.content)
      )
    } catch (error) {
      this.logger.error("푸시 발송 실패", error)
    }
  }
}
