import { Test, TestingModule } from "@nestjs/testing"
import { Prisma } from "@repo/database"
import {
  ForbiddenError,
  NotFoundError,
  ValidationError
} from "@repo/api-client"
import { PrismaService } from "../prisma/prisma.service"
import { FeedbackService } from "./feedback.service"

const DAY = 24 * 60 * 60 * 1000
const PERFORMANCE_ID = 1
const ME = 10
const OUTSIDER = 30
// 팀 1: 내 팀(녹음본 있음), 팀 2·3: 다른 대상 팀, 팀 4: 녹음본 없음
const teams = [
  { id: 1, leaderId: ME, recordingUrl: "r1", members: [11] },
  { id: 2, leaderId: 20, recordingUrl: "r2", members: [21] },
  { id: 3, leaderId: 22, recordingUrl: "r3", members: [] },
  { id: 4, leaderId: 23, recordingUrl: null, members: [OUTSIDER] }
]

type Row = {
  id: number
  teamId: number
  reviewerId: number
  teamScore: number | null
  individualScore: number | null
  preferenceScore: number | null
  comment: string | null
  updatedAt: Date
}

const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test"
  })

describe("FeedbackService", () => {
  let service: FeedbackService
  let schedule: Record<string, Date | null>
  let rows: Row[]
  let raceOnce: boolean

  const key = (teamId: number, reviewerId: number) =>
    rows.find((r) => r.teamId === teamId && r.reviewerId === reviewerId)
  const merge = (row: Row, data: Partial<Row>) => {
    for (const [k, v] of Object.entries(data))
      if (v !== undefined) Object.assign(row, { [k]: v })
    return row
  }

  beforeEach(async () => {
    const now = Date.now()
    schedule = {
      recruitStartAt: new Date(now - 10 * DAY),
      recruitEndAt: new Date(now - 5 * DAY),
      feedbackStartAt: new Date(now - DAY),
      feedbackEndAt: new Date(now + 5 * DAY),
      decidedAt: null,
      endAt: null
    }
    rows = []
    raceOnce = false

    type Where = { teamId_reviewerId: { teamId: number; reviewerId: number } }
    const prisma = {
      performance: {
        findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
          where.id === PERFORMANCE_ID
            ? {
                id: PERFORMANCE_ID,
                ...schedule,
                teams: teams.map((t) => ({
                  id: t.id,
                  leaderId: t.leaderId,
                  recordingUrl: t.recordingUrl,
                  teamSessions: [
                    { members: t.members.map((userId) => ({ userId })) }
                  ]
                }))
              }
            : null
        )
      },
      team: {
        findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
          teams.some((t) => t.id === where.id)
            ? { performanceId: PERFORMANCE_ID }
            : null
        )
      },
      feedback: {
        findMany: jest.fn(
          async ({ where }: { where: { reviewerId: number } }) =>
            rows.filter((r) => r.reviewerId === where.reviewerId)
        ),
        upsert: jest.fn(
          async ({
            where,
            create,
            update
          }: {
            where: Where
            create: Partial<Row>
            update: Partial<Row>
          }) => {
            const { teamId, reviewerId } = where.teamId_reviewerId
            if (raceOnce) {
              // 다른 요청이 같은 행을 먼저 만들었다
              raceOnce = false
              rows.push({
                id: rows.length + 1,
                teamId,
                reviewerId,
                teamScore: 1,
                individualScore: null,
                preferenceScore: null,
                comment: null,
                updatedAt: new Date()
              })
              throw p2002()
            }
            const found = key(teamId, reviewerId)
            if (found) return merge(found, update)
            const row = merge(
              {
                id: rows.length + 1,
                teamId,
                reviewerId,
                teamScore: null,
                individualScore: null,
                preferenceScore: null,
                comment: null,
                updatedAt: new Date()
              },
              create
            )
            rows.push(row)
            return row
          }
        ),
        update: jest.fn(
          async ({ where, data }: { where: Where; data: Partial<Row> }) => {
            const { teamId, reviewerId } = where.teamId_reviewerId
            const found = key(teamId, reviewerId)
            if (!found) throw new Error("not found")
            return merge(found, data)
          }
        )
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackService, { provide: PrismaService, useValue: prisma }]
    }).compile()
    service = module.get(FeedbackService)
  })

  afterEach(() => jest.useRealTimers())

  describe("getMine", () => {
    it("대상 팀·본인 팀·자격·내 행을 돌려준다", async () => {
      await service.upsert(2, ME, { teamScore: 4 })

      const mine = await service.getMine(PERFORMANCE_ID, ME)

      expect(mine).toMatchObject({
        stage: "EVALUATION",
        eligible: true,
        ownTeamIds: [1],
        targetTeamIds: [1, 2, 3]
      })
      expect(mine.feedbacks.map((f) => [f.teamId, f.teamScore])).toEqual([
        [2, 4]
      ])
    })

    it("피드백 단계가 끝나도 내 행을 돌려준다", async () => {
      await service.upsert(2, ME, { teamScore: 4 })
      schedule.feedbackEndAt = new Date(Date.now() - 1000)

      const mine = await service.getMine(PERFORMANCE_ID, ME)

      expect(mine.stage).toBe("DECISION")
      expect(mine.feedbacks).toHaveLength(1)
    })

    it("미제출 팀만의 소속자는 자격이 없다", async () => {
      expect((await service.getMine(PERFORMANCE_ID, OUTSIDER)).eligible).toBe(
        false
      )
    })

    it("공연이 없으면 찾을 수 없다고 알린다", async () => {
      await expect(service.getMine(99, ME)).rejects.toThrow(NotFoundError)
    })
  })

  describe("upsert", () => {
    it("모집 단계에서는 거부한다", async () => {
      schedule.recruitEndAt = new Date(Date.now() + DAY)
      schedule.feedbackStartAt = new Date(Date.now() + 2 * DAY)

      await expect(service.upsert(2, ME, { teamScore: 3 })).rejects.toThrow(
        ForbiddenError
      )
    })

    it("집계 단계에서는 거부한다", async () => {
      schedule.feedbackEndAt = new Date(Date.now() - 1000)

      await expect(service.upsert(2, ME, { teamScore: 3 })).rejects.toThrow(
        ForbiddenError
      )
    })

    it("feedbackEndAt 정각이면 거부한다", async () => {
      jest.useFakeTimers().setSystemTime(schedule.feedbackEndAt as Date)

      await expect(service.upsert(2, ME, { teamScore: 3 })).rejects.toThrow(
        ForbiddenError
      )
    })

    it("본인 팀이면 거부한다", async () => {
      await expect(service.upsert(1, ME, { teamScore: 3 })).rejects.toThrow(
        ForbiddenError
      )
    })

    it("녹음본 없는 팀이면 거부한다", async () => {
      await expect(service.upsert(4, ME, { teamScore: 3 })).rejects.toThrow(
        ValidationError
      )
    })

    it("대상 팀 소속이 아니면 거부한다", async () => {
      await expect(
        service.upsert(2, OUTSIDER, { teamScore: 3 })
      ).rejects.toThrow(ForbiddenError)
    })

    it("팀이 없으면 찾을 수 없다고 알린다", async () => {
      await expect(service.upsert(99, ME, { teamScore: 3 })).rejects.toThrow(
        NotFoundError
      )
    })

    it("보낸 필드만 바꾼다", async () => {
      await service.upsert(2, ME, { teamScore: 3 })
      await service.upsert(2, ME, { preferenceScore: 5 })

      expect(key(2, ME)).toMatchObject({ teamScore: 3, preferenceScore: 5 })
    })

    it("동시 생성 경합(P2002)이면 다시 update해서 저장한다", async () => {
      raceOnce = true

      await service.upsert(2, ME, { individualScore: 4 })

      expect(key(2, ME)).toMatchObject({ teamScore: 1, individualScore: 4 })
    })
  })
})
