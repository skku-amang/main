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
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamUpdatedEvent
} from "../team/team.events"
import { PerformanceCreatedEvent } from "../performance/performance.events"

const team = {
  id: 7,
  name: "팀A",
  performanceId: 3,
  leaderId: 4,
  teamSessions: [
    { sessionId: 1, members: [{ userId: 1 }, { userId: 2 }] },
    { sessionId: 2, members: [{ userId: 3 }] }
  ]
}

describe("NotificationListener", () => {
  let listener: NotificationListener
  let prisma: {
    team: { findUnique: jest.Mock }
    user: { findUnique: jest.Mock; findMany: jest.Mock }
    session: { findMany: jest.Mock }
    performance: { findUnique: jest.Mock }
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
        findMany: jest.fn(async () => [{ name: "VOCAL" }, { name: "GUITAR" }])
      },
      performance: { findUnique: jest.fn(async () => null) },
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
      expect([...event.recipientIds].sort()).toEqual([1, 2, 3])
      expect(event.payload.changeType).toBe("REMOVED")
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
})
