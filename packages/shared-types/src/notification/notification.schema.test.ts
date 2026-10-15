import { describe, expect, it } from "vitest"
import {
  GetNotificationsQuerySchema,
  NotificationItemSchema
} from "./notification.schema"

const base = { id: 1, readAt: null, createdAt: "2026-10-15T00:00:00.000Z" }

describe("NotificationItemSchema", () => {
  it("type에 맞는 payload를 파싱하고 날짜를 Date로 바꾼다", () => {
    const item = NotificationItemSchema.parse({
      ...base,
      type: "TEAM_CREATED",
      payload: {
        performanceId: 3,
        performanceName: "봄 공연",
        teamId: 7,
        teamName: "팀A"
      }
    })
    expect(item.type).toBe("TEAM_CREATED")
    expect(item.createdAt).toBeInstanceOf(Date)
    if (item.type === "TEAM_CREATED") expect(item.payload.teamName).toBe("팀A")
  })

  it("type과 payload 구조가 어긋나면 거부한다", () => {
    const result = NotificationItemSchema.safeParse({
      ...base,
      type: "PERFORMANCE_CREATED",
      payload: { teamId: 7, teamName: "팀A" }
    })
    expect(result.success).toBe(false)
  })

  it("멤버 변경 payload의 sessionNames는 SessionName enum만 허용한다", () => {
    const result = NotificationItemSchema.safeParse({
      ...base,
      type: "TEAM_MEMBER_CHANGE",
      payload: {
        teamId: 7,
        performanceId: 3,
        teamName: "팀A",
        changeType: "ADDED",
        memberName: "홍길동",
        sessionNames: ["PIANO"]
      }
    })
    expect(result.success).toBe(false)
  })
})

describe("GetNotificationsQuerySchema", () => {
  it("비어 있으면 limit 기본값 20", () => {
    expect(GetNotificationsQuerySchema.parse({})).toEqual({ limit: 20 })
  })

  it("쿼리스트링 문자열을 숫자로 변환한다", () => {
    expect(
      GetNotificationsQuerySchema.parse({ cursor: "42", limit: "5" })
    ).toEqual({ cursor: 42, limit: 5 })
  })

  it("limit 50 초과는 거부한다", () => {
    expect(GetNotificationsQuerySchema.safeParse({ limit: 51 }).success).toBe(
      false
    )
  })
})
