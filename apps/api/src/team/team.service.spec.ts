import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PerformanceRecruitmentClosedError } from "@repo/api-client"
import { TeamService } from "./team.service"
import {
  TEAM_EVENTS,
  TeamCreatedEvent,
  TeamMemberAddedEvent,
  TeamUpdatedEvent
} from "./team.events"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

const DAY = 24 * 60 * 60 * 1000
const CLOSED_ID = 1
const OPEN_ID = 2
const UNDATED_ID = 3
const ACTOR = 99

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

type StoredSession = {
  id: number
  sessionId: number
  capacity: number
  members: { id: number; userId: number; index: number }[]
}

describe("TeamService", () => {
  let service: TeamService
  let emit: jest.Mock
  let storedTeam: {
    id: number
    performanceId: number
    teamSessions: StoredSession[]
  }

  beforeEach(async () => {
    storedTeam = { id: 10, performanceId: CLOSED_ID, teamSessions: [] }
    emit = jest.fn()

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
          ...baseTeam,
          ...storedTeam,
          description: null,
          image: null,
          songYoutubeVideoUrl: null
        })),
        create: jest.fn(() => storedTeam),
        update: jest.fn()
      },
      teamSession: {
        deleteMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
      },
      teamMember: {
        createMany: jest.fn(),
        deleteMany: jest.fn()
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
        },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  const emitted = (name: string) =>
    emit.mock.calls.filter(([n]) => n === name).map(([, event]) => event)

  describe("create", () => {
    it("마감된 공연에는 팀을 만들 수 없다", async () => {
      await expect(
        service.create({ ...baseTeam, performanceId: CLOSED_ID }, ACTOR)
      ).rejects.toBeInstanceOf(PerformanceRecruitmentClosedError)
    })

    it.each([
      ["모집 중인 공연", OPEN_ID],
      ["종료 일시가 비어 있는 공연", UNDATED_ID]
    ])("%s에는 팀을 만들 수 있다", async (_, performanceId) => {
      await expect(
        service.create({ ...baseTeam, performanceId }, ACTOR)
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("팀이 만들어지면 team.created를 발행한다", async () => {
      await service.create({ ...baseTeam, performanceId: OPEN_ID }, ACTOR)

      expect(emitted(TEAM_EVENTS.CREATED)).toEqual([
        new TeamCreatedEvent(storedTeam.id, ACTOR)
      ])
    })
  })

  describe("update", () => {
    it("마감된 공연의 팀도 공연을 바꾸지 않는 수정은 할 수 있다", async () => {
      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, performanceId: CLOSED_ID },
          ACTOR
        )
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("마감된 공연에서 모집 중인 공연으로 옮길 수 있다", async () => {
      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, performanceId: OPEN_ID },
          ACTOR
        )
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("모집 중인 공연에서 마감된 공연으로 옮길 수 없다", async () => {
      storedTeam.performanceId = OPEN_ID

      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, performanceId: CLOSED_ID },
          ACTOR
        )
      ).rejects.toBeInstanceOf(PerformanceRecruitmentClosedError)
    })

    it("바뀐 게 없으면 team.updated를 발행하지 않는다", async () => {
      await service.update(storedTeam.id, { ...baseTeam }, ACTOR)

      expect(emitted(TEAM_EVENTS.UPDATED)).toEqual([])
    })

    it("곡명이 바뀌면 team.updated에 바뀐 필드가 담긴다", async () => {
      await service.update(
        storedTeam.id,
        { ...baseTeam, songName: "새 곡" },
        ACTOR
      )

      expect(emitted(TEAM_EVENTS.UPDATED)).toEqual([
        new TeamUpdatedEvent(storedTeam.id, ["songName"], ACTOR)
      ])
    })

    it("로스터에 새 멤버가 들어오면 그 멤버의 team.member.added를 발행한다", async () => {
      storedTeam.teamSessions = [
        { id: 100, sessionId: 1, capacity: 2, members: [] }
      ]

      await service.update(
        storedTeam.id,
        {
          ...baseTeam,
          memberSessions: [
            { sessionId: 1, capacity: 2, members: [{ userId: 5, index: 1 }] }
          ]
        },
        ACTOR
      )

      expect(emitted(TEAM_EVENTS.MEMBER_ADDED)).toEqual([
        new TeamMemberAddedEvent(storedTeam.id, 5, [1], ACTOR)
      ])
      expect(emitted(TEAM_EVENTS.UPDATED)).toEqual([])
    })
  })

  describe("apply", () => {
    it("여러 세션에 한 번에 지원하면 team.member.added 1건에 세션을 모두 담는다", async () => {
      storedTeam.teamSessions = [
        { id: 100, sessionId: 1, capacity: 2, members: [] },
        { id: 101, sessionId: 2, capacity: 1, members: [] }
      ]

      await service.apply(storedTeam.id, 5, [
        { sessionId: 1, index: 1 },
        { sessionId: 2, index: 1 }
      ])

      expect(emitted(TEAM_EVENTS.MEMBER_ADDED)).toEqual([
        new TeamMemberAddedEvent(storedTeam.id, 5, [1, 2], 5)
      ])
    })
  })
})
