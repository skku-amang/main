import { Injectable, Logger } from "@nestjs/common"
import { NotFoundError } from "@repo/api-client"
import { NotificationType } from "@repo/database"
import {
  GetNotificationsQuery,
  MarkNotificationsReadBySubject,
  NotificationItemSchema,
  NotificationList,
  UnreadNotificationCount
} from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"

/** 대상 페이지에서 "본 것"으로 칠 수 있는 알림 유형. 팀 멤버 변경은 공연 페이지에선 안 보이므로 teamId 쪽에만 */
const SUBJECT_TYPES = {
  teamId: [
    NotificationType.TEAM_MEMBER_CHANGE,
    NotificationType.TEAM_ATTRIBUTE_CHANGE,
    NotificationType.TEAM_CREATED,
    NotificationType.TEAM_LEADER_CHANGED,
    NotificationType.TEAM_FILLED,
    NotificationType.BOOKMARKED_TEAM_SPOT_OPENED
  ],
  performanceId: [
    NotificationType.PERFORMANCE_CREATED,
    NotificationType.PERFORMANCE_UPDATED,
    NotificationType.TEAM_CREATED,
    NotificationType.TEAM_DELETED
  ]
} as const

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

  /** 대상(팀/공연) 페이지에 도달한 사용자의 그 대상 알림을 읽음 처리한다 */
  async markReadBySubject(
    recipientId: number,
    subject: MarkNotificationsReadBySubject
  ) {
    const key = subject.teamId !== undefined ? "teamId" : "performanceId"
    const { count } = await this.prisma.notification.updateMany({
      where: {
        recipientId,
        readAt: null,
        type: { in: [...SUBJECT_TYPES[key]] },
        payload: { path: [key], equals: subject[key] }
      },
      data: { readAt: new Date() }
    })
    return { count }
  }
}
