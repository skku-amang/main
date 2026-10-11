import { Test, TestingModule } from "@nestjs/testing"
import { PerformanceRecruitmentClosedError } from "@repo/api-client"
import { TeamService } from "./team.service"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

const DAY = 24 * 60 * 60 * 1000
const CLOSED_ID = 1
const OPEN_ID = 2
const UNDATED_ID = 3

const performanceEndAt: Record<number, Date | null> = {
  [CLOSED_ID]: new Date(Date.now() - DAY),
  [OPEN_ID]: new Date(Date.now() + DAY),
  [UNDATED_ID]: null
}

const baseTeam = {
  name: "팀",
  leaderId: 1,
  songName: "곡",
  songArtist: "아티스트",
  isFreshmenFixed: false,
  isSelfMade: false,
  memberSessions: []
}

describe("TeamService", () => {
  let service: TeamService
  let storedTeam: { id: number; performanceId: number }

  beforeEach(async () => {
    storedTeam = { id: 10, performanceId: CLOSED_ID }

    const prisma = {
      performance: {
        findUnique: jest.fn(({ where }: { where: { id: number } }) =>
          where.id in performanceEndAt
            ? { endAt: performanceEndAt[where.id] }
            : null
        )
      },
      team: {
        findUnique: jest.fn(() => ({
          ...storedTeam,
          image: null,
          teamSessions: []
        })),
        create: jest.fn(() => storedTeam),
        update: jest.fn()
      },
      teamSession: {
        deleteMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
      },
      $transaction: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ObjectStorageService,
          useValue: { deleteObjectSafely: jest.fn() }
        }
      ]
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  describe("create", () => {
    it("마감된 공연에는 팀을 만들 수 없다", async () => {
      await expect(
        service.create({ ...baseTeam, performanceId: CLOSED_ID })
      ).rejects.toBeInstanceOf(PerformanceRecruitmentClosedError)
    })

    it.each([
      ["모집 중인 공연", OPEN_ID],
      ["종료 일시가 비어 있는 공연", UNDATED_ID]
    ])("%s에는 팀을 만들 수 있다", async (_, performanceId) => {
      await expect(
        service.create({ ...baseTeam, performanceId })
      ).resolves.toMatchObject({ id: storedTeam.id })
    })
  })

  describe("update", () => {
    it("마감된 공연의 팀도 공연을 바꾸지 않는 수정은 할 수 있다", async () => {
      await expect(
        service.update(storedTeam.id, {
          ...baseTeam,
          performanceId: CLOSED_ID
        })
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("마감된 공연에서 모집 중인 공연으로 옮길 수 있다", async () => {
      await expect(
        service.update(storedTeam.id, { ...baseTeam, performanceId: OPEN_ID })
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("모집 중인 공연에서 마감된 공연으로 옮길 수 없다", async () => {
      storedTeam.performanceId = OPEN_ID

      await expect(
        service.update(storedTeam.id, {
          ...baseTeam,
          performanceId: CLOSED_ID
        })
      ).rejects.toBeInstanceOf(PerformanceRecruitmentClosedError)
    })
  })
})
