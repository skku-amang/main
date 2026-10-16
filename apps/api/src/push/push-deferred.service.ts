import { Injectable } from "@nestjs/common"
import { NotificationItemSchema, formatNotification } from "@repo/shared-types"
import { preferencesSelect, toPreferences } from "../notification/preferences"
import { PrismaService } from "../prisma/prisma.service"
import { PushSender } from "./push.sender"
import { QUIET_HOURS_BYPASS, isQuietHours } from "./quiet-hours"

const DAY = 24 * 60 * 60 * 1000

/**
 * 방해금지 시간대에 미뤄 둔 푸시(pushedAt null)를 보낸다. 크론 틀(설계 §3.1)이 10분마다 호출.
 * 수신자마다 방해금지가 끝났는지 보고, 그새 인앱에서 읽었거나 하루 지났거나 유형을 끈 알림은
 * 보내지 않고 처리됨으로 닫는다.
 */
@Injectable()
export class PushDeferredService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: PushSender
  ) {}

  /** @returns 보낸 알림 수 */
  async flush(now: Date) {
    const pending = await this.prisma.notification.findMany({
      where: { pushedAt: null },
      include: { recipient: { select: preferencesSelect } },
      orderBy: { createdAt: "asc" }
    })
    if (pending.length === 0) return 0

    const freshSince = new Date(now.getTime() - DAY)
    const closeIds: number[] = []
    const sendable: typeof pending = []
    for (const row of pending) {
      const preferences = toPreferences(row.recipient)
      if (
        row.readAt !== null ||
        row.createdAt < freshSince ||
        preferences.mutedTypes.includes(row.type)
      ) {
        closeIds.push(row.id)
        continue
      }
      if (
        !QUIET_HOURS_BYPASS.has(row.type) &&
        isQuietHours(now, preferences.quietHours)
      )
        continue
      sendable.push(row)
    }

    if (closeIds.length > 0)
      await this.prisma.notification.updateMany({
        where: { id: { in: closeIds }, pushedAt: null },
        data: { pushedAt: now }
      })
    if (sendable.length === 0) return 0

    // 먼저 처리됨으로 찍고(claim) 보낸다 — 다음 tick이나 리스너와 겹쳐도 같은 row가 두 번 나가지 않는다
    const claimed = await this.prisma.notification.updateManyAndReturn({
      where: { id: { in: sendable.map((r) => r.id) }, pushedAt: null },
      data: { pushedAt: now },
      select: { id: true }
    })
    const claimedIds = new Set(claimed.map((c) => c.id))

    let sent = 0
    for (const row of sendable) {
      if (!claimedIds.has(row.id)) continue
      const item = NotificationItemSchema.safeParse(row)
      if (!item.success) continue

      await this.sender.sendToUsers(
        [row.recipientId],
        formatNotification(item.data)
      )
      sent += 1
    }
    return sent
  }
}
