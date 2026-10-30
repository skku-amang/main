import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import {
  ForbiddenError,
  PerformanceRecruitmentClosedError
} from "@repo/api-client"
import { TeamService } from "./team.service"
import {
  TEAM_EVENTS,
  TeamCreatedEvent,
  TeamDeletedEvent,
  TeamLeaderChangedEvent,
  TeamMemberAddedEvent,
  TeamUpdatedEvent
} from "./team.events"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => new Date(Date.now() - days * DAY)
const later = (days: number) => new Date(Date.now() + days * DAY)
const RECRUITING_ID = 1
const SUBMISSION_ID = 2
const EVALUATION_ID = 3
const DONE_ID = 4
const PREPARING_ID = 5
const UNDATED_RECRUIT_END_ID = 6
const ACTOR = 99
const ADMIN = 50
const GUITAR_ID = 2

type Schedule = Record<
  | "recruitStartAt"
  | "recruitEndAt"
  | "feedbackStartAt"
  | "feedbackEndAt"
  | "decidedAt"
  | "endAt",
  Date | null
>
const noDates: Schedule = {
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  decidedAt: null,
  endAt: null
}
let schedules: Record<number, Schedule>
const resetSchedules = () => {
  schedules = {
    [RECRUITING_ID]: {
      ...noDates,
      recruitStartAt: ago(5),
      recruitEndAt: later(5)
    },
    [SUBMISSION_ID]: {
      ...noDates,
      recruitStartAt: ago(10),
      recruitEndAt: ago(1),
      feedbackStartAt: later(5)
    },
    [EVALUATION_ID]: {
      ...noDates,
      recruitStartAt: ago(10),
      recruitEndAt: ago(5),
      feedbackStartAt: ago(1),
      feedbackEndAt: later(5)
    },
    [DONE_ID]: { ...noDates, recruitStartAt: ago(30), endAt: ago(1) },
    [PREPARING_ID]: { ...noDates },
    [UNDATED_RECRUIT_END_ID]: { ...noDates, recruitStartAt: ago(5) }
  }
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
    resetSchedules()
    storedTeam = { id: 10, performanceId: RECRUITING_ID, teamSessions: [] }
    emit = jest.fn()

    const prisma = {
      performance: {
        findUnique: jest.fn(({ where }: { where: { id: number } }) =>
          where.id in schedules ? schedules[where.id] : null
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
        update: jest.fn(),
        delete: jest.fn()
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
      session: {
        findUnique: jest.fn(({ where }: { where: { id: number } }) =>
          where.id === GUITAR_ID ? { name: "GUITAR" } : null
        )
      },
      user: {
        findUnique: jest.fn(({ where }: { where: { id: number } }) =>
          where.id === 5
            ? { name: "홍길동", isAdmin: false }
            : where.id === ADMIN
              ? { name: "운영진", isAdmin: true }
              : null
        )
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
    it.each([
      ["준비 단계", PREPARING_ID],
      ["제출 단계", SUBMISSION_ID],
      ["종료된", DONE_ID]
    ])("%s 공연에는 팀을 만들 수 없다", async (_, performanceId) => {
      await expect(
        service.create({ ...baseTeam, performanceId }, ACTOR)
      ).rejects.toMatchObject({
        constructor: PerformanceRecruitmentClosedError,
        detail: "팀 모집 기간이 아닙니다."
      })
    })

    it.each([
      ["모집 중인 공연", RECRUITING_ID],
      ["모집 종료 일시가 비어 있는 공연", UNDATED_RECRUIT_END_ID]
    ])("%s에는 팀을 만들 수 있다", async (_, performanceId) => {
      await expect(
        service.create({ ...baseTeam, performanceId }, ACTOR)
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it("팀이 만들어지면 team.created를 발행한다", async () => {
      await service.create({ ...baseTeam, performanceId: RECRUITING_ID }, ACTOR)

      expect(emitted(TEAM_EVENTS.CREATED)).toEqual([
        new TeamCreatedEvent(storedTeam.id, ACTOR)
      ])
    })
  })

  describe("update", () => {
    it("제출 단계 공연의 팀은 다른 공연으로 옮겨 빠져나갈 수 없다", async () => {
      storedTeam.performanceId = SUBMISSION_ID

      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, performanceId: RECRUITING_ID },
          ACTOR
        )
      ).rejects.toMatchObject({
        detail: "모집이 끝나 팀 구성(멤버·정원·팀장)은 바꿀 수 없습니다."
      })
    })

    it("모집 중인 공연에서 모집이 끝난 공연으로 옮길 수 없다", async () => {
      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, performanceId: SUBMISSION_ID },
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

    it("같은 세션의 다른 자리에 또 지원하면 세션 이름으로 안내한다", async () => {
      storedTeam.teamSessions = [
        {
          id: 100,
          sessionId: GUITAR_ID,
          capacity: 2,
          members: [{ id: 1, userId: 5, index: 1 }]
        }
      ]

      await expect(
        service.apply(storedTeam.id, 5, [{ sessionId: GUITAR_ID, index: 2 }])
      ).rejects.toMatchObject({
        detail: "이미 이 팀의 기타 세션에 지원했습니다."
      })
    })
  })

  describe("unapply", () => {
    it("남의 자리를 취소하려 하면 세션 이름과 자리 번호로 안내한다", async () => {
      storedTeam.teamSessions = [
        {
          id: 100,
          sessionId: GUITAR_ID,
          capacity: 2,
          members: [{ id: 1, userId: 7, index: 2 }]
        }
      ]

      await expect(
        service.unapply(storedTeam.id, 5, [{ sessionId: GUITAR_ID, index: 2 }])
      ).rejects.toMatchObject({
        detail:
          "기타 2번 자리는 본인이 지원한 자리가 아니라 취소할 수 없습니다."
      })
    })
  })

  describe("팀 구성 검사", () => {
    it("한 세션에 같은 사람이 두 번 들어 있으면 이름으로 안내한다", async () => {
      await expect(
        service.create(
          {
            ...baseTeam,
            performanceId: RECRUITING_ID,
            memberSessions: [
              {
                sessionId: GUITAR_ID,
                capacity: 2,
                members: [
                  { userId: 5, index: 1 },
                  { userId: 5, index: 2 }
                ]
              }
            ]
          },
          ACTOR
        )
      ).rejects.toMatchObject({
        detail: "홍길동님이 기타 세션에 두 번 들어 있습니다."
      })
    })
  })

  describe("팀장 교체·삭제 이벤트", () => {
    it("팀장이 바뀌면 team.leader.changed에 새·전 팀장이 담긴다", async () => {
      await service.update(storedTeam.id, { ...baseTeam, leaderId: 2 }, ACTOR)

      expect(emitted(TEAM_EVENTS.LEADER_CHANGED)).toEqual([
        new TeamLeaderChangedEvent(storedTeam.id, 2, baseTeam.leaderId, ACTOR)
      ])
    })

    it("팀장이 그대로면 team.leader.changed는 없다", async () => {
      await service.update(storedTeam.id, { ...baseTeam }, ACTOR)

      expect(emitted(TEAM_EVENTS.LEADER_CHANGED)).toEqual([])
    })

    it("팀을 지우면 삭제 전 팀원 목록과 팀명을 담아 team.deleted를 발행한다", async () => {
      storedTeam.teamSessions = [
        {
          id: 100,
          sessionId: 1,
          capacity: 2,
          members: [
            { id: 1, userId: 5, index: 1 },
            { id: 2, userId: 6, index: 2 }
          ]
        }
      ]

      await service.remove(storedTeam.id, ACTOR)

      const [event] = emitted(TEAM_EVENTS.DELETED) as TeamDeletedEvent[]
      expect(event).toMatchObject({
        teamId: storedTeam.id,
        teamName: baseTeam.name,
        performanceId: storedTeam.performanceId,
        actorId: ACTOR
      })
      expect([...event!.memberIds].sort()).toEqual([1, 5, 6])
    })
  })

  describe("단계별 잠금", () => {
    const guitarSession = (members: { userId: number; index: number }[]) => ({
      sessionId: GUITAR_ID,
      capacity: 2,
      members
    })
    const storeGuitar = (userIds: number[]) => {
      storedTeam.teamSessions = [
        {
          id: 100,
          sessionId: GUITAR_ID,
          capacity: 2,
          members: userIds.map((userId, i) => ({
            id: i + 1,
            userId,
            index: i + 1
          }))
        }
      ]
    }

    it("제출 단계에서는 지원할 수 없다", async () => {
      storedTeam.performanceId = SUBMISSION_ID
      storeGuitar([])

      await expect(
        service.apply(storedTeam.id, 5, [{ sessionId: GUITAR_ID, index: 1 }])
      ).rejects.toMatchObject({
        detail: "팀 모집 기간이 아니라 지원·탈퇴할 수 없습니다."
      })
    })

    it("제출 단계에서는 탈퇴할 수 없다", async () => {
      storedTeam.performanceId = SUBMISSION_ID
      storeGuitar([5])

      await expect(
        service.unapply(storedTeam.id, 5, [{ sessionId: GUITAR_ID, index: 1 }])
      ).rejects.toMatchObject({
        detail: "팀 모집 기간이 아니라 지원·탈퇴할 수 없습니다."
      })
    })

    it.each([
      [
        "멤버 추가",
        { memberSessions: [guitarSession([{ userId: 5, index: 1 }])] }
      ],
      ["팀장 교체", { leaderId: 2 }],
      ["정원 변경", { memberSessions: [{ ...guitarSession([]), capacity: 3 }] }]
    ])("제출 단계에서 %s 거부", async (_, change) => {
      storedTeam.performanceId = SUBMISSION_ID
      storeGuitar([])

      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, memberSessions: [guitarSession([])], ...change },
          ACTOR
        )
      ).rejects.toMatchObject({
        detail: "모집이 끝나 팀 구성(멤버·정원·팀장)은 바꿀 수 없습니다."
      })
    })

    it("제출 단계에서 곡 정보·이름·설명은 바꿀 수 있다", async () => {
      storedTeam.performanceId = SUBMISSION_ID
      storeGuitar([5])

      await expect(
        service.update(
          storedTeam.id,
          {
            ...baseTeam,
            name: "새 이름",
            songName: "새 곡",
            description: "설명",
            memberSessions: [guitarSession([{ userId: 5, index: 1 }])]
          },
          ACTOR
        )
      ).resolves.toMatchObject({ id: storedTeam.id })
    })

    it.each([
      ["피드백", EVALUATION_ID],
      ["종료", DONE_ID]
    ])("%s 단계에서는 어떤 수정도 거부", async (_, performanceId) => {
      storedTeam.performanceId = performanceId

      await expect(
        service.update(storedTeam.id, { ...baseTeam, songName: "새 곡" }, ACTOR)
      ).rejects.toMatchObject({
        detail: "피드백 단계부터는 팀을 수정할 수 없습니다."
      })
    })

    it("모집이 끝난 팀은 삭제할 수 없다", async () => {
      storedTeam.performanceId = DONE_ID

      await expect(service.remove(storedTeam.id, ACTOR)).rejects.toMatchObject({
        detail: "모집이 끝난 팀은 삭제할 수 없습니다."
      })
    })

    it("운영진이 피드백 시작을 미루면 같은 팀을 다시 수정할 수 있다", async () => {
      storedTeam.performanceId = EVALUATION_ID
      await expect(
        service.update(storedTeam.id, { ...baseTeam, songName: "새 곡" }, ACTOR)
      ).rejects.toMatchObject({
        detail: "피드백 단계부터는 팀을 수정할 수 없습니다."
      })

      schedules[EVALUATION_ID] = {
        ...schedules[EVALUATION_ID]!,
        feedbackStartAt: later(3),
        feedbackEndAt: later(6)
      }

      await expect(
        service.update(storedTeam.id, { ...baseTeam, songName: "새 곡" }, ACTOR)
      ).resolves.toMatchObject({ id: storedTeam.id })
    })
  })

  describe("신입고정팀 권한", () => {
    it("운영진이 아니면 신입고정팀 설정을 바꿀 수 없다", async () => {
      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, isFreshmenFixed: true },
          ACTOR
        )
      ).rejects.toMatchObject({
        constructor: ForbiddenError,
        detail: "신입고정팀 설정은 운영진만 바꿀 수 있습니다."
      })
    })

    it("운영진이 아니면 신입고정팀으로 만들 수 없다", async () => {
      await expect(
        service.create(
          { ...baseTeam, performanceId: RECRUITING_ID, isFreshmenFixed: true },
          ACTOR
        )
      ).rejects.toBeInstanceOf(ForbiddenError)
    })

    it("운영진은 신입고정팀 설정을 바꿀 수 있다", async () => {
      await expect(
        service.update(
          storedTeam.id,
          { ...baseTeam, isFreshmenFixed: true },
          ADMIN
        )
      ).resolves.toMatchObject({ id: storedTeam.id })
    })
  })
})
