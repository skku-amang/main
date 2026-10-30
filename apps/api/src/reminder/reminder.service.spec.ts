import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PrismaService } from "../prisma/prisma.service"
import { ReminderService } from "./reminder.service"
import {
  EquipmentReturnDueEvent,
  REMINDER_EVENTS,
  RoomReservationSoonEvent,
  TeamRecruitmentDeadlineEvent
} from "./reminder.events"

// 2026-10-16 23:50 KST — 한국 날짜로 "내일"은 10-17
const NOW = new Date("2026-10-16T14:50:00Z")
const TOMORROW_KST = new Date("2026-10-17T10:00:00Z") // 10-17 19:00 KST
const minutes = (m: number) => new Date(NOW.getTime() + m * 60_000)

type Range = { gt: Date; lte: Date }
type StoredTeam = {
  id: number
  performance: {
    recruitEndAt: Date | null
    endAt?: Date | null
    recruitStartAt?: Date | null
    decidedAt?: Date | null
  }
  teamSessions: { capacity: number; members: { userId: number }[] }[]
}
type StoredRental = {
  id: number
  category: string
  startAt: Date
  endAt: Date
}
type StoredNotification = {
  type: string
  createdAt: Date
  payload: Record<string, unknown>
}

const inRange = (at: Date, range: Range | undefined) =>
  range === undefined || (at > range.gt && at <= range.lte)

const incomplete = [{ capacity: 2, members: [{ userId: 1 }] }]
const full = [{ capacity: 1, members: [{ userId: 1 }] }]

describe("ReminderService", () => {
  let service: ReminderService
  let emit: jest.Mock
  let teams: StoredTeam[]
  let rentals: StoredRental[]
  let notifications: StoredNotification[]

  const emitted = (name: string) =>
    emit.mock.calls
      .filter(([n]) => n === name)
      .map(
        ([, event]) =>
          (event as { teamId?: number; rentalId?: number }).teamId ??
          (event as { rentalId: number }).rentalId
      )
      .sort((a, b) => a - b)

  beforeEach(async () => {
    emit = jest.fn()
    teams = []
    rentals = []
    notifications = []

    const prisma = {
      team: {
        findMany: jest.fn(
          async ({
            where
          }: {
            where: {
              Performance: {
                recruitEndAt: Range
                recruitStartAt: { lte: Date }
                decidedAt: null
                OR: [{ endAt: null }, { endAt: { gt: Date } }]
              }
            }
          }) =>
            teams.filter((t) => {
              const {
                recruitEndAt,
                endAt = null,
                recruitStartAt = new Date(0),
                decidedAt = null
              } = t.performance
              const notOver =
                endAt === null || endAt > where.Performance.OR[1].endAt.gt
              const started =
                recruitStartAt !== null &&
                recruitStartAt <= where.Performance.recruitStartAt.lte
              return (
                recruitEndAt !== null &&
                inRange(recruitEndAt, where.Performance.recruitEndAt) &&
                started &&
                decidedAt === where.Performance.decidedAt &&
                notOver
              )
            })
        )
      },
      equipmentRental: {
        findMany: jest.fn(
          async ({
            where
          }: {
            where: {
              equipment: { category: string | { not: string } }
              startAt?: Range
              endAt?: Range
            }
          }) =>
            rentals.filter((r) => {
              const category = where.equipment.category
              const categoryOk =
                typeof category === "string"
                  ? r.category === category
                  : r.category !== category.not
              return (
                categoryOk &&
                inRange(r.startAt, where.startAt) &&
                inRange(r.endAt, where.endAt)
              )
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

  describe("remindRecruitmentDeadline", () => {
    const emittedTeamIds = () =>
      emitted(REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE)

    it("내일 마감 공연의 빈자리 있는 팀만 이벤트를 낸다", async () => {
      teams = [
        {
          id: 1,
          performance: { recruitEndAt: TOMORROW_KST },
          teamSessions: incomplete
        },
        {
          id: 2,
          performance: { recruitEndAt: TOMORROW_KST },
          teamSessions: full
        }
      ]

      await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(1)

      expect(emittedTeamIds()).toEqual([1])
      expect(emit).toHaveBeenCalledWith(
        REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE,
        new TeamRecruitmentDeadlineEvent(1)
      )
    })

    it("모집이 아직 시작되지 않은 공연은 보내지 않는다", async () => {
      teams = [
        {
          id: 1,
          performance: {
            recruitEndAt: TOMORROW_KST,
            recruitStartAt: new Date("2026-10-17T00:00:00Z")
          },
          teamSessions: incomplete
        }
      ]

      await service.remindRecruitmentDeadline(NOW)

      expect(emitted(REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE)).toEqual([])
    })

    it("공연이 이미 끝났으면 모집 종료가 내일이어도 보내지 않는다", async () => {
      teams = [
        {
          id: 1,
          performance: {
            recruitEndAt: TOMORROW_KST,
            endAt: new Date("2026-10-15T12:00:00Z")
          },
          teamSessions: incomplete
        }
      ]

      await service.remindRecruitmentDeadline(NOW)

      expect(emitted(REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE)).toEqual([])
    })

    it("'내일'은 한국 날짜 기준이다", async () => {
      teams = [
        // 10-17 23:30 KST — 내일
        {
          id: 1,
          performance: { recruitEndAt: new Date("2026-10-17T14:30:00Z") },
          teamSessions: incomplete
        },
        // 10-18 00:30 KST — 모레
        {
          id: 2,
          performance: { recruitEndAt: new Date("2026-10-17T15:30:00Z") },
          teamSessions: incomplete
        },
        // 오늘
        {
          id: 3,
          performance: { recruitEndAt: new Date("2026-10-16T14:55:00Z") },
          teamSessions: incomplete
        },
        // 마감 없음
        {
          id: 4,
          performance: { recruitEndAt: null },
          teamSessions: incomplete
        },
        // 10-18 00:00 KST 정각 — 마지막 지원 가능 순간이 10-17이라 "내일 마감"
        {
          id: 5,
          performance: { recruitEndAt: new Date("2026-10-17T15:00:00Z") },
          teamSessions: incomplete
        },
        // 10-17 00:00 KST 정각 — 오늘 안에 닫힘
        {
          id: 6,
          performance: { recruitEndAt: new Date("2026-10-16T15:00:00Z") },
          teamSessions: incomplete
        }
      ]

      await service.remindRecruitmentDeadline(NOW)

      expect(emittedTeamIds()).toEqual([1, 5])
    })

    it("오늘 이미 보낸 팀은 건너뛰고, 어제 보낸 팀은 다시 보낸다", async () => {
      teams = [
        {
          id: 1,
          performance: { recruitEndAt: TOMORROW_KST },
          teamSessions: incomplete
        },
        {
          id: 2,
          performance: { recruitEndAt: TOMORROW_KST },
          teamSessions: incomplete
        }
      ]
      notifications = [
        {
          type: "TEAM_RECRUITMENT_DEADLINE",
          createdAt: new Date("2026-10-16T03:00:00Z"), // 오늘 12:00 KST
          payload: {
            teamId: 1,
            performanceId: 3,
            teamName: "팀A",
            openSlots: []
          }
        },
        {
          type: "TEAM_RECRUITMENT_DEADLINE",
          createdAt: new Date("2026-10-15T10:00:00Z"), // 어제 19:00 KST
          payload: {
            teamId: 2,
            performanceId: 3,
            teamName: "팀B",
            openSlots: []
          }
        }
      ]

      await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(1)

      expect(emittedTeamIds()).toEqual([2])
    })

    it("보낼 팀이 없으면 알림 조회조차 하지 않는다", async () => {
      teams = [
        {
          id: 2,
          performance: { recruitEndAt: TOMORROW_KST },
          teamSessions: full
        }
      ]

      await expect(service.remindRecruitmentDeadline(NOW)).resolves.toBe(0)

      expect(emit).not.toHaveBeenCalled()
    })
  })

  describe("remindRoomReservations (#797)", () => {
    const room = (partial: Partial<StoredRental> & { id: number }) => ({
      category: "ROOM",
      startAt: minutes(30),
      endAt: minutes(90),
      ...partial
    })

    it("한 시간 안에 시작하는 동방 예약만, 장비 대여는 제외", async () => {
      rentals = [
        room({ id: 1 }),
        room({ id: 2, startAt: minutes(70) }),
        room({ id: 3, startAt: minutes(-5) }),
        room({ id: 4, category: "GUITAR" })
      ]

      await expect(service.remindRoomReservations(NOW)).resolves.toBe(1)

      expect(emitted(REMINDER_EVENTS.ROOM_RESERVATION_SOON)).toEqual([1])
      expect(emit).toHaveBeenCalledWith(
        REMINDER_EVENTS.ROOM_RESERVATION_SOON,
        new RoomReservationSoonEvent(1)
      )
    })

    it("같은 예약은 한 번만 — 이전 tick이 보냈으면 건너뛴다", async () => {
      rentals = [room({ id: 1 }), room({ id: 2 })]
      notifications = [
        {
          type: "ROOM_RESERVATION_SOON",
          createdAt: minutes(-10),
          payload: { rentalId: 1, title: "합주", startAt: minutes(30) }
        }
      ]

      await expect(service.remindRoomReservations(NOW)).resolves.toBe(1)

      expect(emitted(REMINDER_EVENTS.ROOM_RESERVATION_SOON)).toEqual([2])
    })
  })

  describe("remindEquipmentReturns (#798)", () => {
    const item = (partial: Partial<StoredRental> & { id: number }) => ({
      category: "GUITAR",
      startAt: new Date("2026-10-15T03:00:00Z"),
      endAt: minutes(5), // 오늘 23:55 KST
      ...partial
    })

    it("반납 기한이 오늘(KST)인 장비 대여만, 동방은 제외", async () => {
      rentals = [
        item({ id: 1 }),
        // 내일 00:00 KST 정각 — 오늘의 마지막 순간
        item({ id: 2, endAt: new Date("2026-10-16T15:00:00Z") }),
        // 내일 01:00 KST
        item({ id: 3, endAt: new Date("2026-10-16T16:00:00Z") }),
        item({ id: 4, category: "ROOM" })
      ]

      await expect(service.remindEquipmentReturns(NOW)).resolves.toBe(2)

      expect(emitted(REMINDER_EVENTS.EQUIPMENT_RETURN_DUE)).toEqual([1, 2])
      expect(emit).toHaveBeenCalledWith(
        REMINDER_EVENTS.EQUIPMENT_RETURN_DUE,
        new EquipmentReturnDueEvent(1)
      )
    })

    it("오늘 이미 보낸 대여는 건너뛴다", async () => {
      rentals = [item({ id: 1 }), item({ id: 2 })]
      notifications = [
        {
          type: "EQUIPMENT_RETURN_DUE",
          createdAt: new Date("2026-10-16T00:30:00Z"), // 오늘 09:30 KST
          payload: {
            rentalId: 1,
            equipmentId: 2,
            equipmentName: "Yamaha P-125",
            endAt: minutes(5)
          }
        }
      ]

      await expect(service.remindEquipmentReturns(NOW)).resolves.toBe(1)

      expect(emitted(REMINDER_EVENTS.EQUIPMENT_RETURN_DUE)).toEqual([2])
    })
  })
})
