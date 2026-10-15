import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { FormattedNotification } from "@repo/shared-types"
import * as webpush from "web-push"
import { PrismaService } from "../prisma/prisma.service"

export type PushMessage = FormattedNotification

/** 구독이 죽었다는 응답. 해당 구독만 지우고 나머지 발송은 계속한다 */
const isGone = (error: unknown) =>
  error instanceof webpush.WebPushError &&
  (error.statusCode === 404 || error.statusCode === 410)

/**
 * web-push 발송. VAPID 키가 없으면(로컬 기본) 발송을 건너뛴다 — 알림함은 그대로 동작.
 */
@Injectable()
export class PushSender {
  private readonly logger = new Logger(PushSender.name)
  private readonly enabled: boolean

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService
  ) {
    const publicKey = config.get<string>("VAPID_PUBLIC_KEY")
    const privateKey = config.get<string>("VAPID_PRIVATE_KEY")
    const subject = config.get<string>("VAPID_SUBJECT")
    this.enabled = Boolean(publicKey && privateKey && subject)

    if (publicKey && privateKey && subject)
      webpush.setVapidDetails(subject, publicKey, privateKey)
    else this.logger.warn("VAPID 키가 없어 Web Push 발송을 건너뜁니다")
  }

  async sendToUsers(userIds: number[], message: PushMessage) {
    if (!this.enabled || userIds.length === 0) return

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
      select: {
        id: true,
        userId: true,
        endpoint: true,
        p256dh: true,
        auth: true
      }
    })
    if (subscriptions.length === 0) return

    // 앱 아이콘 숫자 배지용. 수신자마다 다르므로 본문을 사람별로 만든다
    const unread = await this.prisma.notification.groupBy({
      by: ["recipientId"],
      where: {
        recipientId: { in: [...new Set(subscriptions.map((s) => s.userId))] },
        readAt: null
      },
      _count: { _all: true }
    })
    const unreadByUser = new Map(
      unread.map((u) => [u.recipientId, u._count._all])
    )
    const payloadFor = (userId: number) =>
      JSON.stringify({ ...message, badge: unreadByUser.get(userId) ?? 0 })

    // TTL: 하루 지난 팀 소식은 안 보낸다 (기본 4주). timeout: 푸시 서비스가 응답을 안 주면 배치 전체가 멈추지 않게
    const options = { TTL: 24 * 60 * 60, timeout: 10_000 }
    const results = await Promise.allSettled(
      subscriptions.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payloadFor(s.userId),
          options
        )
      )
    )

    const deadIds: number[] = []
    results.forEach((result, i) => {
      const subscription = subscriptions[i]
      if (!subscription || result.status !== "rejected") return
      if (isGone(result.reason)) deadIds.push(subscription.id)
      else
        this.logger.warn(
          `푸시 발송 실패 (subscription ${subscription.id})`,
          result.reason
        )
    })

    if (deadIds.length > 0)
      await this.prisma.pushSubscription.deleteMany({
        where: { id: { in: deadIds } }
      })
  }
}
