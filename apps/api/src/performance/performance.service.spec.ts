import { InvalidPerformanceDateError } from "@repo/api-client"
import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PerformanceService } from "./performance.service"
import {
  PERFORMANCE_EVENTS,
  PerformanceCreatedEvent,
  PerformanceUpdatedEvent
} from "./performance.events"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

describe("PerformanceService", () => {
  let service: PerformanceService
  let emit: jest.Mock
  let prisma: { performance: { findUnique: jest.Mock } }
  const existing = {
    id: 3,
    name: "봄 공연",
    location: "소극장",
    startAt: new Date("2026-11-01T10:00:00Z"),
    endAt: new Date("2026-11-01T12:00:00Z"),
    recruitStartAt: null,
    recruitEndAt: null,
    feedbackStartAt: null,
    feedbackEndAt: null,
    image: null,
    teams: []
  }

  beforeEach(async () => {
    emit = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        {
          provide: PrismaService,
          useValue: {
            performance: {
              create: jest.fn(async () => ({ id: 3 })),
              findUnique: jest.fn(async () => existing),
              findMany: jest.fn(async () => [{ ...existing, decidedAt: null }]),
              findAll: jest.fn(),
              findTeamsByPerformanceId: jest.fn(),
              findOne: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            },
            user: { findUnique: jest.fn(async () => ({ isAdmin: false })) }
          }
        },
        {
          provide: ObjectStorageService,
          useValue: {
            deleteObjectSafely: jest.fn()
          }
        },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    service = module.get<PerformanceService>(PerformanceService)
    prisma = module.get(PrismaService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("공연이 만들어지면 performance.created를 발행한다", async () => {
    await service.create({ name: "봄 공연" }, 42)

    expect(emit).toHaveBeenCalledWith(
      PERFORMANCE_EVENTS.CREATED,
      new PerformanceCreatedEvent(3, 42)
    )
  })

  describe("피드백 기간 팀원 가림", () => {
    const DAY = 24 * 60 * 60 * 1000
    const decisionStage = {
      ...existing,
      startAt: new Date(Date.now() + 10 * DAY),
      endAt: new Date(Date.now() + 11 * DAY),
      recruitStartAt: new Date(Date.now() - 10 * DAY),
      recruitEndAt: new Date(Date.now() - 8 * DAY),
      feedbackStartAt: new Date(Date.now() - 5 * DAY),
      feedbackEndAt: new Date(Date.now() - 1 * DAY),
      decidedAt: null,
      teams: [
        {
          id: 1,
          performanceId: 3,
          leaderId: 9,
          leader: { id: 9, name: "팀장" },
          teamSessions: []
        }
      ]
    }

    it("집계 단계 공연의 팀 목록과 상세의 팀장을 가린다", async () => {
      const prismaMock = prisma as unknown as {
        performance: { findUnique: jest.Mock; findMany: jest.Mock }
      }
      prismaMock.performance.findUnique.mockResolvedValue(decisionStage)
      prismaMock.performance.findMany.mockResolvedValue([decisionStage])

      const teams = await service.findTeamsByPerformanceId(3, 5)
      const detail = await service.findOne(3, undefined)

      expect(teams[0]?.leader.name).toBe("비공개")
      expect(detail.teams[0]?.leader.name).toBe("비공개")
    })
  })

  describe("공연 변경 이벤트", () => {
    it("일정이 바뀌면 performance.updated에 바뀐 필드가 담긴다", async () => {
      await service.update(3, { startAt: new Date("2026-11-01T09:00:00Z") }, 42)

      expect(emit).toHaveBeenCalledWith(
        PERFORMANCE_EVENTS.UPDATED,
        new PerformanceUpdatedEvent(3, ["startAt"], 42)
      )
    })

    it("날짜 하나만 바꿔도 기존 일정과 합쳐 순서를 검증한다", async () => {
      prisma.performance.findUnique.mockResolvedValueOnce({
        ...existing,
        recruitEndAt: new Date("2026-10-10T00:00:00Z")
      })

      await expect(
        service.update(
          3,
          { feedbackStartAt: new Date("2026-10-09T00:00:00Z") },
          42
        )
      ).rejects.toThrow(
        new InvalidPerformanceDateError(
          "피드백 시작 일시는 모집 종료 일시보다 이후여야 합니다."
        )
      )
    })

    it("null로 지우는 날짜는 기존 값을 쓰지 않는다", async () => {
      prisma.performance.findUnique.mockResolvedValueOnce({
        ...existing,
        recruitEndAt: new Date("2026-10-10T00:00:00Z"),
        feedbackStartAt: new Date("2026-10-20T00:00:00Z")
      })

      await expect(
        service.update(
          3,
          {
            recruitEndAt: null,
            feedbackStartAt: new Date("2026-10-05T00:00:00Z")
          },
          42
        )
      ).resolves.toBeDefined()
    })

    it("설명만 바뀌면 발행하지 않는다", async () => {
      await service.update(3, { description: "새 설명" }, 42)

      expect(
        emit.mock.calls.some(([name]) => name === PERFORMANCE_EVENTS.UPDATED)
      ).toBe(false)
    })
  })
})
