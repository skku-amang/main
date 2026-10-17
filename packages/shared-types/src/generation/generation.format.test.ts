import { describe, expect, it } from "vitest"
import { formatGenerationOrder } from "./generation.format"

describe("formatGenerationOrder", () => {
  it("2배로 저장된 기수를 실제 기수로", () => {
    expect(formatGenerationOrder(74)).toBe("37")
  })

  it("홀수는 .5 기수", () => {
    expect(formatGenerationOrder(47)).toBe("23.5")
  })
})
