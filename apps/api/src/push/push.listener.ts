import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { formatNotification } from "@repo/shared-types"
import {
  NOTIFICATION_EVENTS,
  NotificationCreatedEvent
} from "../notification/notification.events"
import { preferencesSelect, toPreferences } from "../notification/preferences"
import { PrismaService } from "../prisma/prisma.service"
import { PushSender } from "./push.sender"
import { QUIET_HOURS_BYPASS, isQuietHours } from "./quiet-hours"

/**
 * 저장된 알림(notification.created)에서 파생된 푸시 발송. 알림함이 SSOT이고
 * 푸시는 best-effort라 실패는 로깅만 한다 (ADR-0003 원칙1).
 * 수신자마다 설정(#708)을 본다: 끈 유형은 보내지 않고 처리됨으로, 방해금지 중이면
 * pushedAt을 비워 둔다 — 크론이 아침에 몰아서 보낸다 (PushDeferredService).
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
    try {
      const users = await this.prisma.user.findMany({
        where: { id: { in: event.recipientIds } },
        select: preferencesSelect
      })
      const preferencesOf = new Map(users.map((u) => [u.id, toPreferences(u)]))
      const bypass = QUIET_HOURS_BYPASS.has(event.content.type)

      const mutedIds: number[] = []
      const sendIds: number[] = []
      const sendUserIds: number[] = []
      event.recipientIds.forEach((userId, i) => {
        const id = event.notificationIds[i]
        if (id === undefined) return
        const preferences = preferencesOf.get(userId)
        if (preferences?.mutedTypes.includes(event.content.type)) {
          mutedIds.push(id)
          return
        }
        if (!bypass && preferences && isQuietHours(now, preferences.quietHours))
          return
        sendIds.push(id)
        sendUserIds.push(userId)
      })

      if (mutedIds.length > 0)
        await this.prisma.notification.updateMany({
          where: { id: { in: mutedIds }, pushedAt: null },
          data: { pushedAt: now }
        })
      if (sendIds.length === 0) return

      // 보내기 전에 처리됨으로 찍는다(claim) — flush와 겹쳐도 같은 row가 두 번 나가지 않는다. 발송 실패는 재시도 없음
      const { count } = await this.prisma.notification.updateMany({
        where: { id: { in: sendIds }, pushedAt: null },
        data: { pushedAt: now }
      })
      if (count === 0) return

      await this.sender.sendToUsers(
        sendUserIds,
        formatNotification(event.content)
      )
    } catch (error) {
      this.logger.error("푸시 발송 실패", error)
    }
  }
}
