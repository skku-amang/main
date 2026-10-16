import { BOT_TRACE_SAMPLE_RATE, traceSampleRate } from "./trace-sampling"

describe("traceSampleRate", () => {
  const inherit = (fallback: number) => fallback * 10 // 상위 트레이스 결정을 흉내 — 호출됐는지 결과로 안다

  it("헬스체크는 0", () => {
    expect(traceSampleRate({ url: "http://api/health/live" }, inherit)).toBe(0)
  })

  it("k6 봇은 5%, 상위 트레이스를 따지지 않는다", () => {
    expect(
      traceSampleRate(
        { url: "http://api/teams", headers: { "user-agent": "k6/2.3.0" } },
        inherit
      )
    ).toBe(BOT_TRACE_SAMPLE_RATE)
  })

  it("헤더가 배열이어도 첫 값으로 판정한다", () => {
    expect(
      traceSampleRate(
        { url: "http://api/teams", headers: { "user-agent": ["k6/2.3.0"] } },
        inherit
      )
    ).toBe(BOT_TRACE_SAMPLE_RATE)
  })

  it("그 외는 상위 트레이스를 따르고, 없으면 100%", () => {
    expect(
      traceSampleRate(
        { url: "http://api/teams", headers: { "user-agent": "Mozilla/5.0" } },
        inherit
      )
    ).toBe(10)
    expect(traceSampleRate(undefined, inherit)).toBe(10)
  })
})
