import { describe, expect, it } from "vitest"
import {
  CreateRentalSchema,
  DEFAULT_RENTAL_TITLE
} from "./create-rental.schema"
import { UpdateRentalSchema } from "./update-rental.schema"

const base = {
  equipmentId: 1,
  startAt: "2026-09-17T10:00:00.000Z",
  endAt: "2026-09-17T12:00:00.000Z",
  userIds: [1]
}

describe("CreateRentalSchema title", () => {
  it.each(["", "   "])("빈 제목(%j)은 기본 제목으로 채운다", (title) => {
    expect(CreateRentalSchema.parse({ ...base, title }).title).toBe(
      DEFAULT_RENTAL_TITLE
    )
  })

  it("입력한 제목은 그대로 둔다", () => {
    expect(CreateRentalSchema.parse({ ...base, title: "합주" }).title).toBe(
      "합주"
    )
  })
})

describe("UpdateRentalSchema title", () => {
  it("제목을 보내지 않은 수정 요청은 기존 제목을 덮어쓰지 않는다", () => {
    expect(
      UpdateRentalSchema.parse({ startAt: base.startAt })
    ).not.toHaveProperty("title")
  })
})
