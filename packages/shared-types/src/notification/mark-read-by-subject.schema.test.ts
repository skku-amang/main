import { describe, expect, it } from "vitest"
import { MarkNotificationsReadBySubjectSchema } from "./mark-read-by-subject.schema"

describe("MarkNotificationsReadBySubjectSchema", () => {
  it("teamId 하나만 받는다", () => {
    expect(MarkNotificationsReadBySubjectSchema.parse({ teamId: 7 })).toEqual({
      teamId: 7
    })
  })

  it("performanceId 하나만 받는다", () => {
    expect(
      MarkNotificationsReadBySubjectSchema.parse({ performanceId: 3 })
    ).toEqual({ performanceId: 3 })
  })

  it("둘 다 없거나 둘 다 있으면 거부한다", () => {
    expect(MarkNotificationsReadBySubjectSchema.safeParse({}).success).toBe(
      false
    )
    expect(
      MarkNotificationsReadBySubjectSchema.safeParse({
        teamId: 7,
        performanceId: 3
      }).success
    ).toBe(false)
  })
})
