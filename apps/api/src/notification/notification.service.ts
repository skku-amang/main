import { Injectable } from "@nestjs/common"
import { NotFoundError } from "@repo/api-client"
import {
  GetNotificationsQuery,
  NotificationItemSchema,
  NotificationList,
  UnreadNotificationCount
} from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    recipientId: number,
    { cursor, limit }: GetNotificationsQuery
  ): Promise<NotificationList> {
    const rows = await this.prisma.notification.findMany({
      where: { recipientId, ...(cursor && { id: { lt: cursor } }) },
      orderBy: { id: "desc" },
      take: limit + 1
    })

    const hasMore = rows.length > limit
    const items = NotificationItemSchema.array().parse(
      hasMore ? rows.slice(0, limit) : rows
    )

    return {
      items,
      nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null
    }
  }

  async countUnread(recipientId: number): Promise<UnreadNotificationCount> {
    const count = await this.prisma.notification.count({
      where: { recipientId, readAt: null }
    })
    return { count }
  }

  async markRead(recipientId: number, id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId }
    })
    if (!notification)
      throw new NotFoundError(`ID가 ${id}인 알림을 찾을 수 없습니다.`)
    if (notification.readAt) return notification

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    })
  }

  async markAllRead(recipientId: number) {
    const { count } = await this.prisma.notification.updateMany({
      where: { recipientId, readAt: null },
      data: { readAt: new Date() }
    })
    return { count }
  }
}
