import { describe, expect, it } from "vitest"
import { validatePerformanceSchedule } from "./performance.schema"
import {
  getPerformanceStage,
  isPerformanceRecruiting,
  isTeamContentOpen,
  isTeamRosterOpen,
  PERFORMANCE_STAGES
} from "./performance.types"

const base = {
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  decidedAt: null,
  endAt: null
}
const d = (s: string) => new Date(s)
const now = d("2026-10-11T12:00:00Z")

describe("getPerformanceStage", () => {
  it("날짜가 전부 비면 PREPARING", () => {
    expect(getPerformanceStage(base, now)).toBe("PREPARING")
  })

  it("모집 시작만 지났으면 RECRUITING", () => {
    expect(
      getPerformanceStage(
        { ...base, recruitStartAt: d("2026-10-01T00:00:00Z") },
        now
      )
    ).toBe("RECRUITING")
  })

  it("모집 종료 지남 + 피드백 시작 전 = SUBMISSION", () => {
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: d("2026-10-10T00:00:00Z"),
          feedbackStartAt: d("2026-10-20T00:00:00Z")
        },
        now
      )
    ).toBe("SUBMISSION")
  })

  it("모집 종료 == 피드백 시작이면 SUBMISSION 건너뜀", () => {
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: d("2026-10-10T00:00:00Z"),
          feedbackStartAt: d("2026-10-10T00:00:00Z")
        },
        now
      )
    ).toBe("EVALUATION")
  })

  it("피드백 종료 지남 + 미확정 = DECISION", () => {
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-09-01T00:00:00Z"),
          recruitEndAt: d("2026-09-10T00:00:00Z"),
          feedbackStartAt: d("2026-09-20T00:00:00Z"),
          feedbackEndAt: d("2026-10-01T00:00:00Z")
        },
        now
      )
    ).toBe("DECISION")
  })

  it("확정되면 LINEUP", () => {
    expect(
      getPerformanceStage(
        { ...base, decidedAt: d("2026-10-05T00:00:00Z") },
        now
      )
    ).toBe("LINEUP")
  })

  it("공연 종료가 지나면 다른 날짜와 무관하게 DONE", () => {
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          endAt: d("2026-10-10T00:00:00Z")
        },
        now
      )
    ).toBe("DONE")
  })

  it("모집 종료가 비어 있으면 RECRUITING 유지 (옛 공연 endAt null)", () => {
    expect(
      getPerformanceStage(
        { ...base, recruitStartAt: d("2026-10-01T00:00:00Z") },
        now
      )
    ).toBe("RECRUITING")
  })

  it("경계: now == recruitEndAt이면 이미 SUBMISSION", () => {
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: now
        },
        now
      )
    ).toBe("SUBMISSION")
  })
})

describe("isPerformanceRecruiting", () => {
  it("RECRUITING이면 true", () => {
    expect(
      isPerformanceRecruiting(
        { ...base, recruitStartAt: d("2026-10-01T00:00:00Z") },
        now
      )
    ).toBe(true)
  })

  it("모집 종료가 지났으면 false", () => {
    expect(
      isPerformanceRecruiting(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: d("2026-10-10T00:00:00Z")
        },
        now
      )
    ).toBe(false)
  })
})

describe("isTeamRosterOpen / isTeamContentOpen", () => {
  it.each(PERFORMANCE_STAGES)("%s", (s) => {
    expect(isTeamRosterOpen(s)).toBe(s === "RECRUITING")
    expect(isTeamContentOpen(s)).toBe(s === "RECRUITING" || s === "SUBMISSION")
  })
})

describe("validatePerformanceSchedule", () => {
  it("순서가 맞으면 null", () => {
    expect(
      validatePerformanceSchedule({
        recruitStartAt: d("2026-10-01"),
        recruitEndAt: d("2026-10-10"),
        feedbackStartAt: d("2026-10-10"),
        feedbackEndAt: d("2026-10-20"),
        startAt: d("2026-11-01"),
        endAt: d("2026-11-01")
      })
    ).toBeNull()
  })

  it("피드백 시작이 모집 종료보다 앞이면 메시지", () => {
    expect(
      validatePerformanceSchedule({
        recruitEndAt: d("2026-10-10"),
        feedbackStartAt: d("2026-10-09")
      })
    ).toBe("피드백 시작 일시는 모집 종료 일시보다 이후여야 합니다.")
  })

  it("비어 있는 필드는 건너뛴다", () => {
    expect(
      validatePerformanceSchedule({
        recruitStartAt: d("2026-10-01"),
        feedbackEndAt: d("2026-09-01")
      })
    ).toBe("피드백 종료 일시는 모집 시작 일시보다 이후여야 합니다.")
  })

  it("공연 종료가 시작보다 앞이면 기존 메시지", () => {
    expect(
      validatePerformanceSchedule({
        startAt: d("2026-11-02"),
        endAt: d("2026-11-01")
      })
    ).toBe("종료 일시는 시작 일시보다 이후여야 합니다.")
  })
})
