import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PrismaService } from "../prisma/prisma.service"
import { ReminderService } from "./reminder.service"
import {
  REMINDER_EVENTS,
  TeamRecruitmentDeadlineEvent
} from "./reminder.events"

// 2026-10-16 23:50 KST — 한국 날짜로 "내일"은 10-17
const NOW = new Date("2026-10-16T14:50:00Z")
const TOMORROW_KST = new Date("2026-10-17T10:00:00Z") // 10-17 19:00 KST

type StoredTeam = {
  id: number
  performance: { endAt: Date | null }
  teamSessions: { capacity: number; members: { userId: number }[] }[]
}
type StoredNotification = {
  type: string
  createdAt: Date
  payload: Record<string, unknown>
}

const incomplete = [{ capacity: 2, members: [{ userId: 1 }] }]
const full = [{ capacity: 1, members: [{ userId: 1 }] }]

describe("ReminderService.remindRecruitmentDeadline", () => {
  let service: ReminderService
  let emit: jest.Mock
  let teams: StoredTeam[]
  let notifications: StoredNotification[]

  const emittedTeamIds = () =>
    emit.mock.calls
      .filter(([name]) => name === REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE)
      .map(([, event]) => (event as TeamRecruitmentDeadlineEvent).teamId)
      .sort((a, b) => a - b)

  beforeEach(async () => {
    emit = jest.fn()
    teams = []
    notifications = []

    const prisma = {
      team: {
        findMany: jest.fn(
          async ({
            where
          }: {
            where: { Performance: { endAt: { gt: Date; lte: Date } } }
          }) =>
            teams.filter((t) => {
              const endAt = t.performance.endAt
              const { gt, lte } = where.Performance.endAt
              return endAt !== null && endAt > gt && endAt <= lte
            })
        )
      },
      notification: {
        findMany: jest.fn(
          async ({
            where
          }: {
            where: { type: string; createdAt: { gte: Date } }
          }) =>
            notifications.filter(
              (n) => n.type === where.type && n.createdAt >= where.createdAt.gte
            )
        )
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()
    service = module.get(ReminderService)
  })

  it("내일 마감 공연의 빈자리 있는 팀만 이벤트를 낸다", async () => {
    teams = [
      { id: 1, performance: { endAt: TOMORROW_KST }, teamSessions: incomplete },
      { id: 2, performance: { endAt: TOMORROW_KST }, teamSessions: full }
    ]

    await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(1)

    expect(emittedTeamIds()).toEqual([1])
    expect(emit).toHaveBeenCalledWith(
      REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE,
      new TeamRecruitmentDeadlineEvent(1)
    )
  })

  it("'내일'은 한국 날짜 기준이다", async () => {
    teams = [
      // 10-17 23:30 KST — 내일
      {
        id: 1,
        performance: { endAt: new Date("2026-10-17T14:30:00Z") },
        teamSessions: incomplete
      },
      // 10-18 00:30 KST — 모레
      {
        id: 2,
        performance: { endAt: new Date("2026-10-17T15:30:00Z") },
        teamSessions: incomplete
      },
      // 오늘
      {
        id: 3,
        performance: { endAt: new Date("2026-10-16T14:55:00Z") },
        teamSessions: incomplete
      },
      // 마감 없음
      { id: 4, performance: { endAt: null }, teamSessions: incomplete },
      // 10-18 00:00 KST 정각 — 마지막 지원 가능 순간이 10-17이라 "내일 마감"
      {
        id: 5,
        performance: { endAt: new Date("2026-10-17T15:00:00Z") },
        teamSessions: incomplete
      },
      // 10-17 00:00 KST 정각 — 오늘 안에 닫힘
      {
        id: 6,
        performance: { endAt: new Date("2026-10-16T15:00:00Z") },
        teamSessions: incomplete
      }
    ]

    await service.remindRecruitmentDeadline(NOW)

    expect(emittedTeamIds()).toEqual([1, 5])
  })

  it("오늘 이미 보낸 팀은 건너뛰고, 어제 보낸 팀은 다시 보낸다", async () => {
    teams = [
      { id: 1, performance: { endAt: TOMORROW_KST }, teamSessions: incomplete },
      { id: 2, performance: { endAt: TOMORROW_KST }, teamSessions: incomplete }
    ]
    notifications = [
      {
        type: "TEAM_RECRUITMENT_DEADLINE",
        createdAt: new Date("2026-10-16T03:00:00Z"), // 오늘 12:00 KST
        payload: { teamId: 1, performanceId: 3, teamName: "팀A", openSlots: [] }
      },
      {
        type: "TEAM_RECRUITMENT_DEADLINE",
        createdAt: new Date("2026-10-15T10:00:00Z"), // 어제 19:00 KST
        payload: { teamId: 2, performanceId: 3, teamName: "팀B", openSlots: [] }
      }
    ]

    await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(1)

    expect(emittedTeamIds()).toEqual([2])
  })

  it("보낼 팀이 없으면 알림 조회조차 하지 않는다", async () => {
    teams = [
      { id: 2, performance: { endAt: TOMORROW_KST }, teamSessions: full }
    ]

    await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(0)

    expect(emit).not.toHaveBeenCalled()
  })
})
