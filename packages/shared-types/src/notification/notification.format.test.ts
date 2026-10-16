import { describe, expect, it } from "vitest"
import { formatNotification } from "./notification.format"

describe("formatNotification", () => {
  it("멤버 합류: 팀 이름이 제목, 세션은 한글로", () => {
    expect(
      formatNotification({
        type: "TEAM_MEMBER_CHANGE",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          changeType: "ADDED",
          memberName: "홍길동",
          sessionNames: ["VOCAL", "GUITAR"]
        }
      })
    ).toEqual({
      title: "팀A",
      body: "홍길동님이 보컬, 기타 멤버로 합류했습니다",
      href: "/performances/3/teams/7",
      tag: "team-7"
    })
  })

  it("멤버 이탈: 세션이 비어 있으면 세션 문구를 생략한다", () => {
    expect(
      formatNotification({
        type: "TEAM_MEMBER_CHANGE",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          changeType: "REMOVED",
          memberName: "홍길동",
          sessionNames: []
        }
      }).body
    ).toBe("홍길동님이 팀에서 빠졌습니다")
  })

  it("팀 정보 변경: 바뀐 필드를 한글 라벨로 나열한다", () => {
    expect(
      formatNotification({
        type: "TEAM_ATTRIBUTE_CHANGE",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          changedFields: ["songName", "sessions", "performanceId"]
        }
      })
    ).toEqual({
      title: "팀A",
      body: "팀 정보가 바뀌었습니다: 곡명, 세션 구성, 공연",
      href: "/performances/3/teams/7",
      tag: "team-7"
    })
  })

  it("팀 생성: 공연 이름이 제목, 링크는 새 팀", () => {
    expect(
      formatNotification({
        type: "TEAM_CREATED",
        payload: {
          performanceId: 3,
          performanceName: "봄 공연",
          teamId: 9,
          teamName: "팀B"
        }
      })
    ).toEqual({
      title: "봄 공연",
      body: "새 팀이 생겼습니다: 팀B",
      href: "/performances/3/teams/9",
      tag: "team-9"
    })
  })

  it("공연 생성: 링크는 그 공연의 팀 모집 목록", () => {
    expect(
      formatNotification({
        type: "PERFORMANCE_CREATED",
        payload: { performanceId: 3, performanceName: "봄 공연" }
      })
    ).toEqual({
      title: "새 공연",
      body: "봄 공연 팀 모집이 시작됐습니다",
      href: "/performances/3/teams",
      tag: "performance-3"
    })
  })
})

describe("formatNotification — 가입·팀장·공연 변경·팀 삭제·정원", () => {
  it("가입 신청: 운영진용, 가입 대기 목록으로", () => {
    expect(
      formatNotification({
        type: "USER_SIGNED_UP",
        payload: { userId: 5, userName: "홍길동", generationOrder: 23 }
      })
    ).toEqual({
      title: "새 가입 신청",
      body: "23기 홍길동님이 가입을 신청했어요",
      href: "/admin/pending-users",
      tag: "user-signup"
    })
  })

  it("가입 승인: 본인에게, 홈으로", () => {
    expect(
      formatNotification({
        type: "USER_APPROVED",
        payload: { userName: "홍길동" }
      })
    ).toEqual({
      title: "가입 승인",
      body: "홍길동님, AMANG 가입이 승인됐어요. 환영해요!",
      href: "/",
      tag: "user-approved"
    })
  })

  it("팀장 교체: 새 팀장과 전 팀장 문구가 다르다", () => {
    const base = {
      teamId: 7,
      performanceId: 3,
      teamName: "팀A",
      leaderName: "김새팀장"
    }
    expect(
      formatNotification({
        type: "TEAM_LEADER_CHANGED",
        payload: { ...base, assigned: true }
      })
    ).toEqual({
      title: "팀A",
      body: "팀장이 됐어요",
      href: "/performances/3/teams/7",
      tag: "team-7"
    })
    expect(
      formatNotification({
        type: "TEAM_LEADER_CHANGED",
        payload: { ...base, assigned: false }
      }).body
    ).toBe("팀장이 김새팀장님으로 바뀌었어요")
  })

  it("공연 변경: 바뀐 필드를 한글로, 공연 상세로", () => {
    expect(
      formatNotification({
        type: "PERFORMANCE_UPDATED",
        payload: {
          performanceId: 3,
          performanceName: "봄 공연",
          changedFields: ["startAt", "location"]
        }
      })
    ).toEqual({
      title: "봄 공연",
      body: "공연 정보가 바뀌었습니다: 시작 일시, 장소",
      href: "/performances/3",
      tag: "performance-3"
    })
  })

  it("팀 삭제: 팀이 없으므로 공연 팀 목록으로", () => {
    expect(
      formatNotification({
        type: "TEAM_DELETED",
        payload: {
          performanceId: 3,
          performanceName: "봄 공연",
          teamName: "팀A"
        }
      })
    ).toEqual({
      title: "봄 공연",
      body: "팀A 팀이 삭제됐습니다",
      href: "/performances/3/teams",
      tag: "performance-3"
    })
  })

  it("정원 다 참: 팀장에게, 팀 상세로", () => {
    expect(
      formatNotification({
        type: "TEAM_FILLED",
        payload: { teamId: 7, performanceId: 3, teamName: "팀A" }
      })
    ).toEqual({
      title: "팀A",
      body: "멤버가 모두 모였어요",
      href: "/performances/3/teams/7",
      tag: "team-7"
    })
  })

  it("별표한 팀 빈자리: 세션 이름을 풀어서, 팀 상세로", () => {
    expect(
      formatNotification({
        type: "BOOKMARKED_TEAM_SPOT_OPENED",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          sessionNames: ["VOCAL"]
        }
      })
    ).toEqual({
      title: "별표한 팀에 자리가 났어요",
      body: "팀A 팀 보컬 자리가 비었어요",
      href: "/performances/3/teams/7",
      tag: "team-7"
    })
  })

  it("별표한 팀 빈자리: 세션 정보가 없으면 팀 이름만", () => {
    expect(
      formatNotification({
        type: "BOOKMARKED_TEAM_SPOT_OPENED",
        payload: {
          teamId: 7,
          performanceId: 3,
          teamName: "팀A",
          sessionNames: []
        }
      }).body
    ).toBe("팀A 팀 자리가 비었어요")
  })
})
