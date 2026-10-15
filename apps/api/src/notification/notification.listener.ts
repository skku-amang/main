import { Injectable, Logger } from "@nestjs/common"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { NotificationType, Prisma } from "@repo/database"
import { NotificationContent } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import {
  PERFORMANCE_EVENTS,
  PerformanceCreatedEvent
} from "../performance/performance.events"
import {
  TEAM_EVENTS,
  TeamCreatedEvent,
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamUpdatedEvent
} from "../team/team.events"
import {
  NOTIFICATION_EVENTS,
  NotificationCreatedEvent
} from "./notification.events"

const teamSnapshotSelect = {
  id: true,
  name: true,
  performanceId: true,
  leaderId: true,
  teamSessions: { select: { members: { select: { userId: true } } } }
} satisfies Prisma.TeamSelect

type TeamSnapshot = Prisma.TeamGetPayload<{ select: typeof teamSnapshotSelect }>

/**
 * 도메인 이벤트를 알림 row로 바꾼다. 수신자 해석·스냅샷 조립·fan-out 저장을 담당하고,
 * 저장이 끝나면 notification.created를 발행해 전달 채널(푸시)에 넘긴다.
 * 실패는 로깅만 한다 — 원본 요청은 이미 커밋됐고, 알림은 best-effort.
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent(TEAM_EVENTS.MEMBER_ADDED)
  onTeamMemberAdded(event: TeamMemberAddedEvent) {
    return this.safely(() => this.notifyMemberChange(event, "ADDED"))
  }

  @OnEvent(TEAM_EVENTS.MEMBER_REMOVED)
  onTeamMemberRemoved(event: TeamMemberRemovedEvent) {
    return this.safely(() => this.notifyMemberChange(event, "REMOVED"))
  }

  @OnEvent(TEAM_EVENTS.UPDATED)
  onTeamUpdated(event: TeamUpdatedEvent) {
    return this.safely(async () => {
      const team = await this.findTeam(event.teamId)
      if (!team) return

      await this.create(
        teamMemberIds(team).filter((id) => id !== event.actorId),
        {
          type: NotificationType.TEAM_ATTRIBUTE_CHANGE,
          payload: {
            teamId: team.id,
            performanceId: team.performanceId,
            teamName: team.name,
            changedFields: event.changedFields
          }
        }
      )
    })
  }

  @OnEvent(TEAM_EVENTS.CREATED)
  onTeamCreated(event: TeamCreatedEvent) {
    return this.safely(async () => {
      const team = await this.findTeam(event.teamId)
      if (!team) return
      const performance = await this.prisma.performance.findUnique({
        where: { id: team.performanceId },
        select: {
          id: true,
          name: true,
          teams: {
            select: {
              leaderId: true,
              teamSessions: {
                select: { members: { select: { userId: true } } }
              }
            }
          }
        }
      })
      if (!performance) return

      const recipientIds = distinct(
        performance.teams.flatMap(teamMemberIds)
      ).filter((id) => id !== event.actorId)

      await this.create(recipientIds, {
        type: NotificationType.TEAM_CREATED,
        payload: {
          performanceId: performance.id,
          performanceName: performance.name,
          teamId: team.id,
          teamName: team.name
        }
      })
    })
  }

  @OnEvent(PERFORMANCE_EVENTS.CREATED)
  onPerformanceCreated(event: PerformanceCreatedEvent) {
    return this.safely(async () => {
      const performance = await this.prisma.performance.findUnique({
        where: { id: event.performanceId },
        select: { id: true, name: true }
      })
      if (!performance) return
      const users = await this.prisma.user.findMany({
        where: { isApproved: true },
        select: { id: true }
      })

      await this.create(
        users.map((u) => u.id).filter((id) => id !== event.actorId),
        {
          type: NotificationType.PERFORMANCE_CREATED,
          payload: {
            performanceId: performance.id,
            performanceName: performance.name
          }
        }
      )
    })
  }

  private async notifyMemberChange(
    event: TeamMemberAddedEvent | TeamMemberRemovedEvent,
    changeType: "ADDED" | "REMOVED"
  ) {
    const [team, member, sessions] = await Promise.all([
      this.findTeam(event.teamId),
      this.prisma.user.findUnique({
        where: { id: event.userId },
        select: { name: true }
      }),
      this.prisma.session.findMany({
        where: { id: { in: event.sessionIds } },
        select: { name: true }
      })
    ])
    if (!team || !member) return

    // 제거된 멤버는 커밋 뒤 스냅샷에 없지만 이벤트 시점엔 팀원이었다 — 본인도 받는다 (스스로 나간 경우는 actor 제외로 빠짐)
    const recipientIds = distinct([
      ...teamMemberIds(team),
      ...(changeType === "REMOVED" ? [event.userId] : [])
    ]).filter((id) => id !== event.actorId)

    await this.create(recipientIds, {
      type: NotificationType.TEAM_MEMBER_CHANGE,
      payload: {
        teamId: team.id,
        performanceId: team.performanceId,
        teamName: team.name,
        changeType,
        memberName: member.name,
        sessionNames: sessions.map((s) => s.name)
      }
    })
  }

  private findTeam(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      select: teamSnapshotSelect
    })
  }

  private async create(recipientIds: number[], content: NotificationContent) {
    if (recipientIds.length === 0) return

    await this.prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        type: content.type,
        payload: content.payload
      }))
    })
    this.eventEmitter.emit(
      NOTIFICATION_EVENTS.CREATED,
      new NotificationCreatedEvent(recipientIds, content)
    )
  }

  private async safely(work: () => Promise<void>) {
    try {
      await work()
    } catch (error) {
      this.logger.error("알림 생성 실패", error)
    }
  }
}

function teamMemberIds(team: Pick<TeamSnapshot, "leaderId" | "teamSessions">) {
  return distinct([
    team.leaderId,
    ...team.teamSessions.flatMap((s) => s.members.map((m) => m.userId))
  ])
}

function distinct(ids: number[]) {
  return [...new Set(ids)]
}
