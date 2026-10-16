import { Injectable } from "@nestjs/common"
import { NotificationItemSchema, formatNotification } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import { PushSender } from "./push.sender"
import { isQuietHours } from "./quiet-hours"

const DAY = 24 * 60 * 60 * 1000

/**
 * 방해금지 시간대에 미뤄 둔 푸시(pushedAt null)를 보낸다. 크론 틀(설계 §3.1)이 10분마다 호출.
 * 그새 인앱에서 읽었거나 하루 지난 알림은 보내지 않고 처리됨으로 닫는다.
 */
@Injectable()
export class PushDeferredService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: PushSender
  ) {}

  /** @returns 보낸 알림 수 */
  async flush(now: Date) {
    if (isQuietHours(now)) return 0

    await this.prisma.notification.updateMany({
      where: {
        pushedAt: null,
        OR: [
          { readAt: { not: null } },
          { createdAt: { lt: new Date(now.getTime() - DAY) } }
        ]
      },
      data: { pushedAt: now }
    })

    const rows = await this.prisma.notification.findMany({
      where: { pushedAt: null },
      orderBy: { createdAt: "asc" }
    })
    if (rows.length === 0) return 0

    for (const row of rows) {
      const item = NotificationItemSchema.safeParse(row)
      if (!item.success) continue
      await this.sender.sendToUsers(
        [row.recipientId],
        formatNotification(item.data)
      )
    }
    await this.prisma.notification.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { pushedAt: now }
    })
    return rows.length
  }
}
