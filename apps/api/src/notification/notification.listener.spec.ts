import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { NotificationListener } from "./notification.listener"
import {
  NOTIFICATION_EVENTS,
  NotificationCreatedEvent
} from "./notification.events"
import { PrismaService } from "../prisma/prisma.service"
import {
  TeamCreatedEvent,
  TeamDeletedEvent,
  TeamLeaderChangedEvent,
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamUpdatedEvent
} from "../team/team.events"
import {
  PerformanceCreatedEvent,
  PerformanceUpdatedEvent
} from "../performance/performance.events"
import { UserApprovedEvent, UserSignedUpEvent } from "../users/users.events"
import { TeamRecruitmentDeadlineEvent } from "../reminder/reminder.events"

const team = {
  id: 7,
  name: "팀A",
  performanceId: 3,
  leaderId: 4,
  teamSessions: [
    { sessionId: 1, capacity: 3, members: [{ userId: 1 }, { userId: 2 }] },
    { sessionId: 2, capacity: 1, members: [{ userId: 3 }] }
  ]
}

describe("NotificationListener", () => {
  let listener: NotificationListener
  let prisma: {
    team: { findUnique: jest.Mock }
    user: { findUnique: jest.Mock; findMany: jest.Mock }
    session: { findMany: jest.Mock }
    performance: { findUnique: jest.Mock }
    teamBookmark: { findMany: jest.Mock }
    notification: { createMany: jest.Mock }
  }
  let emit: jest.Mock

  const createdRows = () =>
    prisma.notification.createMany.mock.calls[0]?.[0].data as {
      recipientId: number
      type: string
      payload: Record<string, unknown>
    }[]
  const recipients = () =>
    createdRows()
      .map((r) => r.recipientId)
      .sort((a, b) => a - b)

  beforeEach(async () => {
    prisma = {
      team: { findUnique: jest.fn(async () => team) },
      user: {
        findUnique: jest.fn(async () => ({ name: "홍길동" })),
        findMany: jest.fn(async () => [])
      },
      session: {
        findMany: jest.fn(async () => [
          { id: 1, name: "VOCAL" },
          { id: 2, name: "GUITAR" }
        ])
      },
      performance: { findUnique: jest.fn(async () => null) },
      teamBookmark: { findMany: jest.fn(async () => []) },
      notification: { createMany: jest.fn(async () => ({ count: 0 })) }
    }
    emit = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationListener,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    listener = module.get(NotificationListener)
  })

  describe("팀 멤버 변경", () => {
    it("팀원과 팀장에게 알리되 행동한 본인은 제외하고, 스냅샷 payload를 담는다", async () => {
      await listener.onTeamMemberAdded(
        new TeamMemberAddedEvent(7, 1, [1, 2], 1)
      )

      expect(recipients()).toEqual([2, 3, 4])
      expect(createdRows()[0]).toMatchObject({
        type: "TEAM_MEMBER_CHANGE",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          changeType: "ADDED",
          memberName: "홍길동",
          sessionNames: ["VOCAL", "GUITAR"]
        }
      })
    })

    it("저장 뒤 notification.created를 같은 수신자로 발행한다", async () => {
      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 4)
      )

      const [name, event] = emit.mock.calls[0]
      expect(name).toBe(NOTIFICATION_EVENTS.CREATED)
      expect(event).toBeInstanceOf(NotificationCreatedEvent)
      expect([...event.recipientIds].sort()).toEqual([1, 2, 3, 9])
      expect(event.content.payload.changeType).toBe("REMOVED")
    })

    it("팀장이 뺀 멤버는 본인도 받고, 스스로 나간 멤버는 받지 않는다", async () => {
      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 4)
      )
      expect(recipients()).toEqual([1, 2, 3, 9])

      prisma.notification.createMany.mockClear()
      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 9)
      )
      expect(recipients()).toEqual([1, 2, 3, 4])
    })

    it("수신자가 없으면 저장도 발행도 하지 않는다", async () => {
      prisma.team.findUnique.mockResolvedValue({
        ...team,
        leaderId: 4,
        teamSessions: [{ sessionId: 1, members: [{ userId: 4 }] }]
      })

      await listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 4, [1], 4))

      expect(prisma.notification.createMany).not.toHaveBeenCalled()
      expect(emit).not.toHaveBeenCalled()
    })

    it("팀이 이미 없으면 조용히 끝난다", async () => {
      prisma.team.findUnique.mockResolvedValue(null)

      await expect(
        listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 1, [1], 1))
      ).resolves.toBeUndefined()
      expect(prisma.notification.createMany).not.toHaveBeenCalled()
    })

    it("DB 오류가 나도 예외를 밖으로 던지지 않는다", async () => {
      prisma.team.findUnique.mockRejectedValue(new Error("db down"))

      await expect(
        listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 1, [1], 1))
      ).resolves.toBeUndefined()
    })
  })

  it("모집 마감 D-1은 팀장에게 세션별 빈자리 수를 담아 보낸다 (#796)", async () => {
    await listener.onTeamRecruitmentDeadline(
      new TeamRecruitmentDeadlineEvent(7)
    )

    expect(recipients()).toEqual([4])
    expect(createdRows()[0]).toMatchObject({
      type: "TEAM_RECRUITMENT_DEADLINE",
      payload: {
        teamId: 7,
        performanceId: 3,
        teamName: "팀A",
        openSlots: [{ sessionName: "VOCAL", count: 1 }]
      }
    })
  })

  it("모집 마감 D-1: 그 사이 팀이 꽉 찼으면 보내지 않는다", async () => {
    prisma.team.findUnique.mockResolvedValue({
      ...team,
      teamSessions: [
        { sessionId: 1, capacity: 2, members: [{ userId: 1 }, { userId: 2 }] }
      ]
    })

    await listener.onTeamRecruitmentDeadline(
      new TeamRecruitmentDeadlineEvent(7)
    )

    expect(prisma.notification.createMany).not.toHaveBeenCalled()
  })

  describe("별표한 팀에 자리가 나면 (#794)", () => {
    const rowsOf = (type: string) =>
      prisma.notification.createMany.mock.calls
        .flatMap(
          (c) =>
            c[0].data as {
              recipientId: number
              type: string
              payload: Record<string, unknown>
            }[]
        )
        .filter((r) => r.type === type)

    it("별표한 비멤버에게 빈자리가 난 세션 이름과 함께 알린다", async () => {
      prisma.teamBookmark.findMany.mockResolvedValue([
        { userId: 11 },
        { userId: 12 }
      ])

      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 4)
      )

      const rows = rowsOf("BOOKMARKED_TEAM_SPOT_OPENED")
      expect(rows.map((r) => r.recipientId).sort()).toEqual([11, 12])
      expect(rows[0]!.payload).toEqual({
        teamId: 7,
        performanceId: 3,
        teamName: "팀A",
        sessionNames: ["VOCAL"]
      })
    })

    it("팀원, 팀장, 빠진 당사자, 행동한 사람은 별표했어도 받지 않는다", async () => {
      prisma.teamBookmark.findMany.mockResolvedValue([
        { userId: 1 },
        { userId: 4 },
        { userId: 9 },
        { userId: 99 },
        { userId: 11 }
      ])

      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 99)
      )

      expect(
        rowsOf("BOOKMARKED_TEAM_SPOT_OPENED").map((r) => r.recipientId)
      ).toEqual([11])
    })

    it("빠졌는데도 빈자리가 안 생기면(교체·정원 축소) 보내지 않는다", async () => {
      prisma.teamBookmark.findMany.mockResolvedValue([{ userId: 11 }])
      prisma.team.findUnique.mockResolvedValue({
        ...team,
        teamSessions: [
          { sessionId: 1, capacity: 2, members: [{ userId: 1 }, { userId: 2 }] }
        ]
      })

      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [1], 4)
      )

      expect(rowsOf("BOOKMARKED_TEAM_SPOT_OPENED")).toEqual([])
    })

    it("팀에서 지워진 세션의 멤버 제거는 빈자리가 아니다", async () => {
      prisma.teamBookmark.findMany.mockResolvedValue([{ userId: 11 }])

      await listener.onTeamMemberRemoved(
        new TeamMemberRemovedEvent(7, 9, [5], 4)
      )

      expect(rowsOf("BOOKMARKED_TEAM_SPOT_OPENED")).toEqual([])
    })

    it("멤버가 들어온 경우엔 보내지 않는다", async () => {
      prisma.teamBookmark.findMany.mockResolvedValue([{ userId: 11 }])

      await listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 1, [1], 1))

      expect(rowsOf("BOOKMARKED_TEAM_SPOT_OPENED")).toEqual([])
    })
  })

  it("팀 속성 변경은 팀원·팀장에게 바뀐 필드 목록과 함께 알린다", async () => {
    await listener.onTeamUpdated(
      new TeamUpdatedEvent(7, ["name", "sessions"], 4)
    )

    expect(recipients()).toEqual([1, 2, 3])
    expect(createdRows()[0]).toMatchObject({
      type: "TEAM_ATTRIBUTE_CHANGE",
      payload: {
        teamId: 7,
        teamName: "팀A",
        changedFields: ["name", "sessions"]
      }
    })
  })

  it("팀 생성은 같은 공연의 모든 팀 멤버·팀장에게 중복 없이 알린다", async () => {
    prisma.performance.findUnique.mockResolvedValue({
      id: 3,
      name: "봄 공연",
      teams: [
        {
          leaderId: 4,
          teamSessions: [{ members: [{ userId: 1 }, { userId: 2 }] }]
        },
        { leaderId: 2, teamSessions: [{ members: [{ userId: 5 }] }] }
      ]
    })

    await listener.onTeamCreated(new TeamCreatedEvent(7, 5))

    expect(recipients()).toEqual([1, 2, 4])
    expect(createdRows()[0]).toMatchObject({
      type: "TEAM_CREATED",
      payload: {
        performanceId: 3,
        performanceName: "봄 공연",
        teamId: 7,
        teamName: "팀A"
      }
    })
  })

  it("공연 생성은 승인된 모든 유저에게 알린다 (행동한 운영진 제외)", async () => {
    prisma.performance.findUnique.mockResolvedValue({
      id: 3,
      name: "봄 공연",
      teams: []
    })
    prisma.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 9 }])

    await listener.onPerformanceCreated(new PerformanceCreatedEvent(3, 9))

    expect(recipients()).toEqual([1, 2])
    expect(createdRows()[0]).toMatchObject({
      type: "PERFORMANCE_CREATED",
      payload: { performanceId: 3, performanceName: "봄 공연" }
    })
  })

  describe("가입 신청·승인", () => {
    it("가입 신청은 운영진 전원에게, 이름과 기수를 담아", async () => {
      prisma.user.findUnique.mockResolvedValue({
        name: "홍길동",
        generation: { order: 23 }
      })
      prisma.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }])

      await listener.onUserSignedUp(new UserSignedUpEvent(5))

      expect(recipients()).toEqual([1, 2])
      expect(createdRows()[0]).toMatchObject({
        type: "USER_SIGNED_UP",
        payload: { userId: 5, userName: "홍길동", generationOrder: 23 }
      })
    })

    it("가입 승인은 본인에게", async () => {
      await listener.onUserApproved(new UserApprovedEvent(5))

      expect(recipients()).toEqual([5])
      expect(createdRows()[0]).toMatchObject({
        type: "USER_APPROVED",
        payload: { userName: "홍길동" }
      })
    })
  })

  describe("팀장 교체", () => {
    const allRows = () =>
      prisma.notification.createMany.mock.calls.flatMap(
        (c) =>
          c[0].data as {
            recipientId: number
            type: string
            payload: Record<string, unknown>
          }[]
      )

    it("운영진이 바꾸면 새 팀장(assigned)과 전 팀장 둘 다 받는다", async () => {
      prisma.team.findUnique.mockResolvedValue({ ...team, leaderId: 2 })

      await listener.onTeamLeaderChanged(new TeamLeaderChangedEvent(7, 2, 4, 1))

      const rows = allRows().filter((r) => r.type === "TEAM_LEADER_CHANGED")
      expect(
        rows.map((r) => [r.recipientId, r.payload.assigned]).sort()
      ).toEqual([
        [2, true],
        [4, false]
      ])
      expect(rows[0]!.payload).toMatchObject({
        teamId: 7,
        teamName: "팀A",
        leaderName: "홍길동"
      })
    })

    it("전 팀장이 직접 넘기면 본인(actor)은 받지 않는다", async () => {
      prisma.team.findUnique.mockResolvedValue({ ...team, leaderId: 2 })

      await listener.onTeamLeaderChanged(new TeamLeaderChangedEvent(7, 2, 4, 4))

      expect(allRows().map((r) => r.recipientId)).toEqual([2])
    })
  })

  it("공연 변경은 그 공연 모든 팀원·팀장에게 (행동한 운영진 제외)", async () => {
    prisma.performance.findUnique.mockResolvedValue({
      id: 3,
      name: "봄 공연",
      teams: [
        { leaderId: 4, teamSessions: [{ members: [{ userId: 1 }] }] },
        { leaderId: 2, teamSessions: [{ members: [{ userId: 5 }] }] }
      ]
    })

    await listener.onPerformanceUpdated(
      new PerformanceUpdatedEvent(3, ["startAt", "location"], 1)
    )

    expect(recipients()).toEqual([2, 4, 5])
    expect(createdRows()[0]).toMatchObject({
      type: "PERFORMANCE_UPDATED",
      payload: {
        performanceId: 3,
        performanceName: "봄 공연",
        changedFields: ["startAt", "location"]
      }
    })
  })

  it("팀 삭제는 이벤트가 들고 온 팀원 목록에게 (삭제한 본인 제외), 팀명은 스냅샷", async () => {
    prisma.performance.findUnique.mockResolvedValue({ id: 3, name: "봄 공연" })

    await listener.onTeamDeleted(
      new TeamDeletedEvent(7, "팀A", 3, [1, 2, 4], 4)
    )

    expect(recipients()).toEqual([1, 2])
    expect(createdRows()[0]).toMatchObject({
      type: "TEAM_DELETED",
      payload: { performanceId: 3, performanceName: "봄 공연", teamName: "팀A" }
    })
  })

  describe("정원 다 참", () => {
    const allRows = () =>
      prisma.notification.createMany.mock.calls.flatMap(
        (c) => c[0].data as { recipientId: number; type: string }[]
      )
    const fullTeam = {
      ...team,
      teamSessions: [
        { sessionId: 1, capacity: 2, members: [{ userId: 1 }, { userId: 2 }] },
        { sessionId: 2, capacity: 1, members: [{ userId: 3 }] }
      ]
    }

    it("마지막 자리에 스스로 지원해 꽉 차면 팀장에게 TEAM_FILLED", async () => {
      prisma.team.findUnique.mockResolvedValue(fullTeam)

      await listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 2, [1], 2))

      const filled = allRows().filter((r) => r.type === "TEAM_FILLED")
      expect(filled.map((r) => r.recipientId)).toEqual([4])
    })

    it("아직 빈자리가 있으면 TEAM_FILLED 없음", async () => {
      prisma.team.findUnique.mockResolvedValue({
        ...fullTeam,
        teamSessions: [{ sessionId: 1, capacity: 3, members: [{ userId: 1 }] }]
      })

      await listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 1, [1], 1))

      expect(allRows().some((r) => r.type === "TEAM_FILLED")).toBe(false)
    })

    it("팀장이 로스터 편집으로 채운 경우는 보내지 않는다", async () => {
      prisma.team.findUnique.mockResolvedValue(fullTeam)

      await listener.onTeamMemberAdded(new TeamMemberAddedEvent(7, 2, [1], 4))

      expect(allRows().some((r) => r.type === "TEAM_FILLED")).toBe(false)
    })
  })
})
