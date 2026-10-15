import { Injectable, Logger } from "@nestjs/common"
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
  private readonly logger = new Logger(NotificationService.name)

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
    const page = hasMore ? rows.slice(0, limit) : rows

    // 스키마와 어긋난 row 하나가 알림함 전체를 막지 않도록 건너뛴다. cursor는 원본 page 기준.
    const items = page.flatMap((row) => {
      const parsed = NotificationItemSchema.safeParse(row)
      if (parsed.success) return [parsed.data]
      this.logger.warn(`알림 ${row.id}의 payload가 스키마와 맞지 않아 건너뜀`)
      return []
    })

    return {
      items,
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null
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
