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
      href: "/performances/3/teams/7"
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
      body: "곡명, 세션 구성, 공연이 바뀌었습니다",
      href: "/performances/3/teams/7"
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
      href: "/performances/3/teams/9"
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
      href: "/performances/3/teams"
    })
  })
})
