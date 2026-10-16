import { Injectable, Logger } from "@nestjs/common"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { NotificationType, Prisma, SessionName } from "@repo/database"
import { NotificationContent } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import {
  PERFORMANCE_EVENTS,
  PerformanceCreatedEvent,
  PerformanceUpdatedEvent
} from "../performance/performance.events"
import {
  TEAM_EVENTS,
  TeamCreatedEvent,
  TeamDeletedEvent,
  TeamLeaderChangedEvent,
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamUpdatedEvent
} from "../team/team.events"
import {
  USER_EVENTS,
  UserApprovedEvent,
  UserSignedUpEvent
} from "../users/users.events"
import {
  EquipmentReturnDueEvent,
  REMINDER_EVENTS,
  RoomReservationSoonEvent,
  TeamRecruitmentDeadlineEvent
} from "../reminder/reminder.events"
import {
  NOTIFICATION_EVENTS,
  NotificationCreatedEvent
} from "./notification.events"

const teamSnapshotSelect = {
  id: true,
  name: true,
  performanceId: true,
  leaderId: true,
  teamSessions: {
    select: {
      sessionId: true,
      capacity: true,
      members: { select: { userId: true } }
    }
  }
} satisfies Prisma.TeamSelect

type TeamSnapshot = Prisma.TeamGetPayload<{ select: typeof teamSnapshotSelect }>

const rentalSnapshotSelect = {
  id: true,
  title: true,
  startAt: true,
  endAt: true,
  equipmentId: true,
  renterId: true,
  users: { select: { id: true } },
  equipment: { select: { brand: true, model: true } }
} satisfies Prisma.EquipmentRentalSelect

/** 공연 소속 전원(모든 팀의 멤버·팀장)을 뽑기 위한 select */
const performanceMembersSelect = {
  id: true,
  name: true,
  teams: {
    select: {
      leaderId: true,
      teamSessions: { select: { members: { select: { userId: true } } } }
    }
  }
} satisfies Prisma.PerformanceSelect

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
        select: performanceMembersSelect
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

  @OnEvent(PERFORMANCE_EVENTS.UPDATED)
  onPerformanceUpdated(event: PerformanceUpdatedEvent) {
    return this.safely(async () => {
      const performance = await this.prisma.performance.findUnique({
        where: { id: event.performanceId },
        select: performanceMembersSelect
      })
      if (!performance) return

      await this.create(
        distinct(performance.teams.flatMap(teamMemberIds)).filter(
          (id) => id !== event.actorId
        ),
        {
          type: NotificationType.PERFORMANCE_UPDATED,
          payload: {
            performanceId: performance.id,
            performanceName: performance.name,
            changedFields: event.changedFields
          }
        }
      )
    })
  }

  @OnEvent(TEAM_EVENTS.DELETED)
  onTeamDeleted(event: TeamDeletedEvent) {
    return this.safely(async () => {
      const performance = await this.prisma.performance.findUnique({
        where: { id: event.performanceId },
        select: { id: true, name: true }
      })
      if (!performance) return

      await this.create(
        event.memberIds.filter((id) => id !== event.actorId),
        {
          type: NotificationType.TEAM_DELETED,
          payload: {
            performanceId: performance.id,
            performanceName: performance.name,
            teamName: event.teamName
          }
        }
      )
    })
  }

  @OnEvent(TEAM_EVENTS.LEADER_CHANGED)
  onTeamLeaderChanged(event: TeamLeaderChangedEvent) {
    return this.safely(async () => {
      const [team, leader] = await Promise.all([
        this.findTeam(event.teamId),
        this.prisma.user.findUnique({
          where: { id: event.newLeaderId },
          select: { name: true }
        })
      ])
      if (!team || !leader) return

      const base = {
        teamId: team.id,
        performanceId: team.performanceId,
        teamName: team.name,
        leaderName: leader.name
      }
      // 새 팀장과 전 팀장은 문구가 달라 row를 따로 만든다. 행동한 본인은 제외
      for (const [recipientId, assigned] of [
        [event.newLeaderId, true],
        [event.formerLeaderId, false]
      ] as const) {
        if (recipientId === event.actorId) continue
        await this.create([recipientId], {
          type: NotificationType.TEAM_LEADER_CHANGED,
          payload: { ...base, assigned }
        })
      }
    })
  }

  @OnEvent(USER_EVENTS.SIGNED_UP)
  onUserSignedUp(event: UserSignedUpEvent) {
    return this.safely(async () => {
      const [user, admins] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: event.userId },
          select: { name: true, generation: { select: { order: true } } }
        }),
        this.prisma.user.findMany({
          where: { isAdmin: true },
          select: { id: true }
        })
      ])
      if (!user) return

      await this.create(
        admins.map((a) => a.id),
        {
          type: NotificationType.USER_SIGNED_UP,
          payload: {
            userId: event.userId,
            userName: user.name,
            generationOrder: user.generation.order
          }
        }
      )
    })
  }

  @OnEvent(USER_EVENTS.APPROVED)
  onUserApproved(event: UserApprovedEvent) {
    return this.safely(async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: event.userId },
        select: { name: true }
      })
      if (!user) return

      await this.create([event.userId], {
        type: NotificationType.USER_APPROVED,
        payload: { userName: user.name }
      })
    })
  }

  @OnEvent(REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE)
  onTeamRecruitmentDeadline(event: TeamRecruitmentDeadlineEvent) {
    return this.safely(async () => {
      const team = await this.findTeam(event.teamId)
      if (!team) return

      const open = team.teamSessions.filter(
        (s) => s.members.length < s.capacity
      )
      // 크론 판정과 리스너 사이에 마지막 자리가 찼으면 보낼 이유가 없다
      if (open.length === 0) return
      const sessions = await this.prisma.session.findMany({
        where: { id: { in: open.map((s) => s.sessionId) } },
        select: { id: true, name: true }
      })
      const nameOf = new Map(sessions.map((s) => [s.id, s.name]))

      await this.create([team.leaderId], {
        type: NotificationType.TEAM_RECRUITMENT_DEADLINE,
        payload: {
          teamId: team.id,
          performanceId: team.performanceId,
          teamName: team.name,
          openSlots: open.flatMap((s) => {
            const sessionName = nameOf.get(s.sessionId)
            return sessionName
              ? [{ sessionName, count: s.capacity - s.members.length }]
              : []
          })
        }
      })
    })
  }

  @OnEvent(REMINDER_EVENTS.ROOM_RESERVATION_SOON)
  onRoomReservationSoon(event: RoomReservationSoonEvent) {
    return this.safely(async () => {
      const rental = await this.findRental(event.rentalId)
      if (!rental) return

      await this.create(rentalMemberIds(rental), {
        type: NotificationType.ROOM_RESERVATION_SOON,
        payload: {
          rentalId: rental.id,
          title: rental.title,
          startAt: rental.startAt
        }
      })
    })
  }

  @OnEvent(REMINDER_EVENTS.EQUIPMENT_RETURN_DUE)
  onEquipmentReturnDue(event: EquipmentReturnDueEvent) {
    return this.safely(async () => {
      const rental = await this.findRental(event.rentalId)
      if (!rental) return

      await this.create(rentalMemberIds(rental), {
        type: NotificationType.EQUIPMENT_RETURN_DUE,
        payload: {
          rentalId: rental.id,
          equipmentId: rental.equipmentId,
          equipmentName: `${rental.equipment.brand} ${rental.equipment.model}`,
          endAt: rental.endAt
        }
      })
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
        select: { id: true, name: true }
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

    if (changeType === "REMOVED")
      await this.notifyBookmarkers(team, event, sessions)

    // 스스로 지원해 마지막 자리가 찼을 때만 팀장에게. 팀장이 로스터를 편집한 경우는 본인이 아니까 제외
    const selfApplied = event.actorId === event.userId
    const filled = team.teamSessions.every(
      (s) => s.members.length >= s.capacity
    )
    if (changeType === "ADDED" && selfApplied && filled)
      await this.create(
        [team.leaderId].filter((id) => id !== event.actorId),
        {
          type: NotificationType.TEAM_FILLED,
          payload: {
            teamId: team.id,
            performanceId: team.performanceId,
            teamName: team.name
          }
        }
      )
  }

  /**
   * 별표한 사람 중 아직 팀원이 아닌 사람에게. 빠진 당사자와 행동한 사람은 제외.
   * 교체·정원 축소·세션 삭제처럼 빠졌는데도 빈자리가 안 생긴 경우는 커밋 후 스냅샷으로 걸러낸다
   */
  private async notifyBookmarkers(
    team: TeamSnapshot,
    event: TeamMemberRemovedEvent,
    sessions: { id: number; name: SessionName }[]
  ) {
    const openedSessionIds = new Set(
      team.teamSessions
        .filter(
          (s) =>
            event.sessionIds.includes(s.sessionId) &&
            s.members.length < s.capacity
        )
        .map((s) => s.sessionId)
    )
    const opened = sessions.filter((s) => openedSessionIds.has(s.id))
    if (opened.length === 0) return

    const bookmarks = await this.prisma.teamBookmark.findMany({
      where: { teamId: team.id },
      select: { userId: true }
    })
    const excluded = new Set([
      ...teamMemberIds(team),
      event.userId,
      event.actorId
    ])

    await this.create(
      bookmarks.map((b) => b.userId).filter((id) => !excluded.has(id)),
      {
        type: NotificationType.BOOKMARKED_TEAM_SPOT_OPENED,
        payload: {
          teamId: team.id,
          performanceId: team.performanceId,
          teamName: team.name,
          sessionNames: opened.map((s) => s.name)
        }
      }
    )
  }

  private findTeam(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      select: teamSnapshotSelect
    })
  }

  private findRental(id: number) {
    return this.prisma.equipmentRental.findUnique({
      where: { id },
      select: rentalSnapshotSelect
    })
  }

  private async create(recipientIds: number[], content: NotificationContent) {
    if (recipientIds.length === 0) return

    const rows = await this.prisma.notification.createManyAndReturn({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        type: content.type,
        payload: content.payload
      })),
      select: { id: true, recipientId: true }
    })
    // 수신자↔row 쌍을 같은 row에서 뽑아 INSERT 반환 순서에 기대지 않는다
    this.eventEmitter.emit(
      NOTIFICATION_EVENTS.CREATED,
      new NotificationCreatedEvent(
        rows.map((r) => r.recipientId),
        content,
        rows.map((r) => r.id)
      )
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

function teamMemberIds(team: {
  leaderId: number
  teamSessions: { members: { userId: number }[] }[]
}) {
  return distinct([
    team.leaderId,
    ...team.teamSessions.flatMap((s) => s.members.map((m) => m.userId))
  ])
}

/** 예약자(탈퇴로 null일 수 있음) ∪ 함께 쓰는 멤버 */
function rentalMemberIds(rental: {
  renterId: number | null
  users: { id: number }[]
}) {
  return distinct([
    ...(rental.renterId === null ? [] : [rental.renterId]),
    ...rental.users.map((u) => u.id)
  ])
}

function distinct(ids: number[]) {
  return [...new Set(ids)]
}
