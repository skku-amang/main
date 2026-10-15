import { memberProfileSelect, toMemberProfile } from "./member-profile"
import { Prisma } from "@repo/database"

type ProfileRow = Prisma.UserGetPayload<{ select: typeof memberProfileSelect }>

const performance = (id: number, startAt: string) => ({
  id,
  name: `공연${id}`,
  startAt: new Date(startAt)
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
  it("비공개 프로필은 다른 사람에게 이름·사진만 보여준다", () => {
    expect(toMemberProfile(row({ isProfilePublic: false }), 99)).toEqual({
      id: 7,
      name: "홍길동",
      image: null,
      isPublic: false
    })
  })

  it("본인은 비공개여도 전체를 본다", () => {
    expect(toMemberProfile(row({ isProfilePublic: false }), 7).isPublic).toBe(
      true
    )
  })

  it("공개 프로필은 자기소개·기수·세션을 보여준다", () => {
    const profile = toMemberProfile(row(), 99)
    expect(profile).toMatchObject({
      isPublic: true,
      nickname: "길동",
      bio: "드럼 칩니다",
      generation: { order: 30 }
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
})
