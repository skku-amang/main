import { changedTeamFields, diffRoster } from "./team.events"

describe("diffRoster", () => {
  const session = (sessionId: number, ...userIds: number[]) => ({
    sessionId,
    members: userIds.map((userId) => ({ userId }))
  })

  it("같은 유저가 같은 세션에 남아 있으면 변화가 없다", () => {
    const { added, removed } = diffRoster(
      [session(1, 10, 11)],
      [session(1, 11, 10)]
    )
    expect(added.size).toBe(0)
    expect(removed.size).toBe(0)
  })

  it("새로 들어온 유저는 added에 세션 목록과 함께 잡힌다", () => {
    const { added, removed } = diffRoster(
      [session(1, 10)],
      [session(1, 10, 12), session(2, 12)]
    )
    expect(added.get(12)).toEqual([1, 2])
    expect(removed.size).toBe(0)
  })

  it("빠진 유저는 removed에 잡힌다", () => {
    const { added, removed } = diffRoster(
      [session(1, 10, 11)],
      [session(1, 10)]
    )
    expect(removed.get(11)).toEqual([1])
    expect(added.size).toBe(0)
  })

  it("세션을 옮긴 유저는 removed와 added 양쪽에 잡힌다", () => {
    const { added, removed } = diffRoster([session(1, 10)], [session(2, 10)])
    expect(removed.get(10)).toEqual([1])
    expect(added.get(10)).toEqual([2])
  })

  it("세션 전체가 삭제되면 그 멤버들은 removed다", () => {
    const { removed } = diffRoster(
      [session(1, 10), session(2, 11)],
      [session(1, 10)]
    )
    expect(removed.get(11)).toEqual([2])
    expect(removed.has(10)).toBe(false)
  })
})

describe("changedTeamFields", () => {
  const existing = {
    name: "팀A",
    description: null,
    image: null,
    songName: "곡",
    songArtist: "가수",
    isFreshmenFixed: false,
    isSelfMade: false,
    songYoutubeVideoUrl: null,
    leaderId: 1,
    performanceId: 5,
    teamSessions: [
      { sessionId: 1, capacity: 1 },
      { sessionId: 2, capacity: 2 }
    ]
  }
  const sameDto = {
    name: "팀A",
    songName: "곡",
    songArtist: "가수",
    isFreshmenFixed: false,
    isSelfMade: false,
    leaderId: 1,
    memberSessions: [
      { sessionId: 1, capacity: 1, members: [] },
      { sessionId: 2, capacity: 2, members: [] }
    ]
  }

  it("값이 같으면 빈 배열", () => {
    expect(changedTeamFields(existing, sameDto)).toEqual([])
  })

  it("null인 기존 값에 undefined가 오면 변경이 아니다", () => {
    expect(
      changedTeamFields(existing, { ...sameDto, description: undefined })
    ).toEqual([])
  })

  it("바뀐 스칼라 필드 이름을 돌려준다", () => {
    expect(
      changedTeamFields(existing, {
        ...sameDto,
        name: "팀B",
        songYoutubeVideoUrl: "https://youtu.be/abc"
      })
    ).toEqual(["name", "songYoutubeVideoUrl"])
  })

  it("공연 이동은 performanceId로 잡히고, 안 보내면 잡히지 않는다", () => {
    expect(
      changedTeamFields(existing, { ...sameDto, performanceId: 6 })
    ).toEqual(["performanceId"])
    expect(
      changedTeamFields(existing, { ...sameDto, performanceId: undefined })
    ).toEqual([])
  })

  it("세션 정원 변경이나 세션 추가·삭제는 sessions로 잡힌다", () => {
    expect(
      changedTeamFields(existing, {
        ...sameDto,
        memberSessions: [
          { sessionId: 1, capacity: 3, members: [] },
          { sessionId: 2, capacity: 2, members: [] }
        ]
      })
    ).toEqual(["sessions"])
    expect(
      changedTeamFields(existing, {
        ...sameDto,
        memberSessions: [{ sessionId: 1, capacity: 1, members: [] }]
      })
    ).toEqual(["sessions"])
  })

  it("멤버만 바뀌고 세션 구성이 같으면 sessions가 아니다", () => {
    expect(
      changedTeamFields(existing, {
        ...sameDto,
        memberSessions: [
          { sessionId: 1, capacity: 1, members: [{ userId: 9, index: 1 }] },
          { sessionId: 2, capacity: 2, members: [] }
        ]
      })
    ).toEqual([])
  })
})
