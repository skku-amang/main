import { describe, expect, it } from "vitest"
import {
  safeNullableString,
  safeOptionalString,
  safeString
} from "./sanitization"

describe("safeString", () => {
  const schema = safeString({ max: 10 })

  it("앞뒤 공백을 제거한다", () => {
    expect(schema.parse("  밴드  ")).toBe("밴드")
  })

  it("공백만 있으면 거부한다", () => {
    expect(schema.safeParse("   ").success).toBe(false)
  })

  it("최대 길이를 넘으면 거부한다", () => {
    expect(schema.safeParse("가".repeat(11)).success).toBe(false)
  })

  it("HTML 태그가 있으면 거부한다", () => {
    expect(schema.safeParse("<b>hi</b>").success).toBe(false)
    expect(schema.safeParse("<img src=x onerror=alert(1)>").success).toBe(false)
  })

  it("꺾쇠가 짝을 이루지 않으면 허용한다", () => {
    expect(schema.parse("<3")).toBe("<3")
    expect(schema.parse("a > b")).toBe("a > b")
  })
})

describe("safeOptionalString", () => {
  const schema = safeOptionalString({ max: 10 })

  it("미입력과 빈 문자열을 허용한다", () => {
    expect(schema.parse(undefined)).toBeUndefined()
    expect(schema.parse("")).toBe("")
  })

  it("HTML 태그가 있으면 거부한다", () => {
    expect(schema.safeParse("<script>").success).toBe(false)
  })
})

describe("safeNullableString", () => {
  const schema = safeNullableString({ max: 10 })

  it("null을 허용한다", () => {
    expect(schema.parse(null)).toBeNull()
  })

  it("HTML 태그가 있으면 거부한다", () => {
    expect(schema.safeParse("<div>").success).toBe(false)
  })
})
