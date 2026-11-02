import { memberProfileSelect, toMemberProfile } from "./member-profile"
import { Prisma } from "@repo/database"

type ProfileRow = Prisma.UserGetPayload<{ select: typeof memberProfileSelect }>

const noDates: Record<
  | "recruitStartAt"
  | "recruitEndAt"
  | "feedbackStartAt"
  | "feedbackEndAt"
  | "decidedAt"
  | "endAt",
  Date | null
> = {
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  decidedAt: null,
  endAt: null
}
const performance = (
  id: number,
  startAt: string,
  schedule: Partial<typeof noDates> = {}
) => ({
  id,
  name: `공연${id}`,
  startAt: new Date(startAt),
  ...noDates,
  endAt: new Date(startAt),
  ...schedule
})
const team = (id: number, perf: ReturnType<typeof performance>) => ({
  id,
  songName: `곡${id}`,
  songArtist: `가수${id}`,
  Performance: perf
})

const spring = performance(1, "2026-04-01")
const fall = performance(2, "2026-10-03")

const row = (overrides: Partial<ProfileRow> = {}): ProfileRow => ({
  id: 7,
  name: "홍길동",
  image: null,
  nickname: "길동",
  bio: "드럼 칩니다",
  isProfilePublic: true,
  generation: { id: 1, order: 30 },
  sessions: [{ id: 3, name: "DRUM" }],
  leadingTeams: [team(10, spring)],
  joinedTeams: [
    { teamSession: { session: { name: "DRUM" }, team: team(10, spring) } },
    { teamSession: { session: { name: "DRUM" }, team: team(20, fall) } },
    { teamSession: { session: { name: "VOCAL" }, team: team(20, fall) } }
  ],
  ...overrides
})

describe("toMemberProfile", () => {
  it("비공개 프로필은 다른 사람에게 소개·참여한 팀을 숨기고 기수·세션은 보여준다", () => {
    expect(toMemberProfile(row({ isProfilePublic: false }), 99)).toEqual({
      id: 7,
      name: "홍길동",
      image: null,
      nickname: "길동",
      generation: { id: 1, order: 30 },
      sessions: [{ id: 3, name: "DRUM" }],
      isPublic: false
    })
  })

  it("본인은 비공개여도 전체를 본다", () => {
    expect(toMemberProfile(row({ isProfilePublic: false }), 7).isPublic).toBe(
      true
    )
  })

  it("공개 프로필은 자기소개를 보여준다", () => {
    expect(toMemberProfile(row(), 99)).toMatchObject({
      isPublic: true,
      bio: "드럼 칩니다"
    })
  })

  it("팀장·팀원으로 참여한 팀을 한 팀씩, 최근 공연부터 보여준다", () => {
    const profile = toMemberProfile(row(), 99)
    if (!profile.isPublic) throw new Error("공개여야 함")
    expect(
      profile.teams.map((t) => ({
        id: t.id,
        isLeader: t.isLeader,
        sessions: t.sessions,
        performance: t.performance.name
      }))
    ).toEqual([
      {
        id: 20,
        isLeader: false,
        sessions: ["DRUM", "VOCAL"],
        performance: "공연2"
      },
      { id: 10, isLeader: true, sessions: ["DRUM"], performance: "공연1" }
    ])
  })

  it("피드백 단계 공연의 팀은 프로필 팀 목록에서 빠지고 일정은 응답에 없다", () => {
    const DAY = 24 * 60 * 60 * 1000
    const evaluating = performance(3, "2027-01-01", {
      feedbackStartAt: new Date(Date.now() - DAY),
      feedbackEndAt: new Date(Date.now() + DAY)
    })
    const profile = toMemberProfile(
      row({ leadingTeams: [team(10, spring), team(30, evaluating)] }),
      99
    )
    if (!profile.isPublic) throw new Error("공개여야 함")

    expect(profile.teams.map((t) => t.id)).toEqual([20, 10])
    expect(Object.keys(profile.teams[1]?.performance ?? {}).sort()).toEqual([
      "id",
      "name",
      "startAt"
    ])
  })

  it("본인 프로필에서는 피드백 단계 공연의 팀도 보인다", () => {
    const DAY = 24 * 60 * 60 * 1000
    const evaluating = performance(3, "2027-01-01", {
      feedbackStartAt: new Date(Date.now() - DAY),
      feedbackEndAt: new Date(Date.now() + DAY)
    })
    const profile = toMemberProfile(
      row({ leadingTeams: [team(30, evaluating)], joinedTeams: [] }),
      7
    )
    if (!profile.isPublic) throw new Error("공개여야 함")

    expect(profile.teams.map((t) => t.id)).toEqual([30])
  })

  it("운영진은 다른 사람 프로필에서도 피드백 단계 공연의 팀을 본다", () => {
    const DAY = 24 * 60 * 60 * 1000
    const evaluating = performance(3, "2027-01-01", {
      feedbackStartAt: new Date(Date.now() - DAY),
      feedbackEndAt: new Date(Date.now() + DAY)
    })
    const someonesRow = row({
      leadingTeams: [team(30, evaluating)],
      joinedTeams: []
    })
    const asAdmin = toMemberProfile(someonesRow, 99, true)
    const asMember = toMemberProfile(someonesRow, 99, false)
    if (!asAdmin.isPublic || !asMember.isPublic) throw new Error("공개여야 함")

    expect(asAdmin.teams.map((t) => t.id)).toEqual([30])
    expect(asMember.teams).toEqual([])
  })
})
