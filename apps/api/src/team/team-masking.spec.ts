import { HIDDEN_USER_ID } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import { maskTeam, maskTeamsFor } from "./team-masking"

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => new Date(Date.now() - days * DAY)
const later = (days: number) => new Date(Date.now() + days * DAY)

const RECRUITING_ID = 1
const EVALUATION_ID = 2
const DECISION_ID = 3
const ADMIN = 50
const MEMBER = 7

const noDates = {
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  decidedAt: null,
  endAt: null
}
const schedules = {
  [RECRUITING_ID]: {
    ...noDates,
    recruitStartAt: ago(1),
    recruitEndAt: later(5)
  },
  [EVALUATION_ID]: {
    ...noDates,
    recruitStartAt: ago(10),
    recruitEndAt: ago(5),
    feedbackStartAt: ago(1),
    feedbackEndAt: later(5)
  },
  [DECISION_ID]: {
    ...noDates,
    recruitStartAt: ago(10),
    recruitEndAt: ago(8),
    feedbackStartAt: ago(5),
    feedbackEndAt: ago(1)
  }
}

const user = (id: number, name: string) => ({
  id,
  name,
  image: "https://img/x.png",
  nickname: "닉",
  generation: { id: 1, order: 33 },
  sessions: [{ id: 1, name: "GUITAR" }]
})

const team = (id: number, performanceId: number) => ({
  id,
  performanceId,
  songName: "곡",
  leaderId: 1,
  leader: user(1, "팀장"),
  teamSessions: [
    {
      id: 100 + id,
      capacity: 2,
      members: [
        { id: 1, userId: 2, index: 1, user: user(2, "멤버1") },
        { id: 2, userId: 3, index: 2, user: user(3, "멤버2") }
      ]
    }
  ]
})

const prisma = {
  performance: {
    findMany: jest.fn(({ where }: { where: { id: { in: number[] } } }) =>
      where.id.in.map((id) => ({
        id,
        ...schedules[id as keyof typeof schedules]
      }))
    )
  },
  user: {
    findUnique: jest.fn(({ where }: { where: { id: number } }) => ({
      isAdmin: where.id === ADMIN
    }))
  }
} as unknown as PrismaService

describe("maskTeam", () => {
  it("팀장·멤버를 비공개로 바꾸고 자리 수는 유지한다", () => {
    const masked = maskTeam(team(10, EVALUATION_ID))

    expect(masked.membersHidden).toBe(true)
    expect(masked.leaderId).toBe(HIDDEN_USER_ID)
    expect(masked.leader).toEqual({
      id: HIDDEN_USER_ID,
      name: "비공개",
      image: null,
      nickname: null,
      generation: null,
      sessions: []
    })
    const members = masked.teamSessions[0]?.members ?? []
    expect(members).toHaveLength(2)
    expect(members.map((m) => m.userId)).toEqual([
      HIDDEN_USER_ID,
      HIDDEN_USER_ID
    ])
    expect(members.map((m) => m.user.name)).toEqual(["비공개", "비공개"])
    expect(members.map((m) => m.index)).toEqual([1, 2])
  })

  it("멤버를 담지 않은 팀도 팀장만 가린다", () => {
    const { teamSessions: _omit, ...withoutSessions } = team(10, EVALUATION_ID)

    expect(maskTeam(withoutSessions).leader.name).toBe("비공개")
  })
})

describe("maskTeamsFor", () => {
  const teams = [
    team(10, RECRUITING_ID),
    team(11, EVALUATION_ID),
    team(12, DECISION_ID)
  ]

  it("피드백·집계 단계 공연의 팀만 가리고 다른 공연 팀은 그대로 둔다", async () => {
    const result = await maskTeamsFor(prisma, teams, MEMBER)

    expect(result.map((t) => t.leader.name)).toEqual([
      "팀장",
      "비공개",
      "비공개"
    ])
    expect(result[0]?.membersHidden).toBeUndefined()
  })

  it("비로그인에게도 가린다", async () => {
    const result = await maskTeamsFor(prisma, teams, undefined)

    expect(result[1]?.leader.name).toBe("비공개")
  })

  it("운영진에게는 가리지 않는다", async () => {
    const result = await maskTeamsFor(prisma, teams, ADMIN)

    expect(result.map((t) => t.leader.name)).toEqual(["팀장", "팀장", "팀장"])
  })
})
