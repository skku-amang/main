import { describe, expect, it } from "vitest"
import {
  FeedbackContext,
  FeedbackScores,
  getFeedbackStatus,
  isCountableFeedback,
  isFeedbackComplete,
  missingDimensions,
  missingReviewsOfTeam,
  MyFeedbackSummary,
  nextFeedbackTeamId,
  orderFeedbackTeams,
  reviewerProgress
} from "./feedback"
import { UpsertFeedbackSchema } from "./upsert-feedback.schema"

const scores = (
  teamScore: number | null,
  individualScore: number | null,
  preferenceScore: number | null
): FeedbackScores => ({ teamScore, individualScore, preferenceScore })

// 팀 1·2·3이 대상(녹음본 있음), 팀 4는 미제출. 사용자 10은 팀 1 소속, 20은 미제출 팀 4만 소속
const ctx: FeedbackContext = {
  targetTeamIds: [1, 2, 3],
  membersByTeam: { 1: [10, 11], 2: [12], 3: [13], 4: [20] }
}

describe("isFeedbackComplete", () => {
  it("세 점수가 다 있어야 완료", () => {
    expect(isFeedbackComplete(scores(3, 4, null))).toBe(false)
    expect(isFeedbackComplete(scores(3, 4, 5))).toBe(true)
  })
})

describe("isCountableFeedback", () => {
  const row = (teamId: number, reviewerId: number) => ({
    ...scores(3, 4, 5),
    teamId,
    reviewerId
  })

  it("완료·대상·자격·본인 팀 아님이면 센다", () => {
    expect(isCountableFeedback(row(2, 10), ctx)).toBe(true)
  })

  it("본인 팀 행은 셀 수 없다", () => {
    expect(isCountableFeedback(row(1, 10), ctx)).toBe(false)
  })

  it("대상이 아닌 팀(녹음본 없음) 행은 셀 수 없다", () => {
    expect(isCountableFeedback(row(4, 10), ctx)).toBe(false)
  })

  it("자격 없는 작성자 행은 셀 수 없다", () => {
    expect(isCountableFeedback(row(2, 20), ctx)).toBe(false)
  })

  it("완료가 아니면 셀 수 없다", () => {
    expect(
      isCountableFeedback(
        { ...scores(3, null, 5), teamId: 2, reviewerId: 10 },
        ctx
      )
    ).toBe(false)
  })
})

describe("getFeedbackStatus", () => {
  const mine = (
    feedbacks: MyFeedbackSummary["feedbacks"]
  ): MyFeedbackSummary => ({
    stage: "EVALUATION",
    eligible: true,
    ownTeamIds: [1],
    targetTeamIds: [1, 2, 3],
    feedbacks
  })
  const fb = (teamId: number, s: FeedbackScores, comment: string | null) => ({
    ...s,
    teamId,
    comment,
    updatedAt: "2026-11-02T00:00:00.000Z"
  })

  it("의견만 있고 점수가 없으면 PARTIAL, 빠진 문항 3개", () => {
    const summary = mine([fb(2, scores(null, null, null), "좋아요")])

    expect(getFeedbackStatus(2, summary)).toBe("PARTIAL")
    expect(missingDimensions(summary.feedbacks[0])).toEqual([
      "teamScore",
      "individualScore",
      "preferenceScore"
    ])
  })

  it("완료면 DONE, 행이 없으면 NONE", () => {
    const summary = mine([fb(2, scores(1, 2, 3), null)])

    expect(getFeedbackStatus(2, summary)).toBe("DONE")
    expect(getFeedbackStatus(3, summary)).toBe("NONE")
  })

  it("본인 팀은 OWN, 대상 아님은 NOT_TARGET", () => {
    const summary = mine([])

    expect(getFeedbackStatus(1, summary)).toBe("OWN")
    expect(getFeedbackStatus(4, summary)).toBe("NOT_TARGET")
  })
})

describe("orderFeedbackTeams", () => {
  it("createdAt 오름차순, 같으면 id 오름차순", () => {
    const teams = [
      { id: 3, createdAt: "2026-10-02T00:00:00.000Z" },
      { id: 2, createdAt: "2026-10-01T00:00:00.000Z" },
      { id: 1, createdAt: "2026-10-02T00:00:00.000Z" }
    ]

    expect(orderFeedbackTeams(teams).map((t) => t.id)).toEqual([2, 1, 3])
  })
})

describe("nextFeedbackTeamId", () => {
  const ORDER = [1, 2, 3, 4, 5]
  const summary = (
    doneTeamIds: number[],
    partialTeamIds: number[] = []
  ): MyFeedbackSummary => ({
    stage: "EVALUATION",
    eligible: true,
    ownTeamIds: [1],
    targetTeamIds: ORDER,
    feedbacks: [
      ...doneTeamIds.map((teamId) => ({ teamId, score: 3 })),
      ...partialTeamIds.map((teamId) => ({ teamId, score: null }))
    ].map(({ teamId, score }) => ({
      teamId,
      teamScore: 3,
      individualScore: score,
      preferenceScore: score,
      comment: null,
      updatedAt: "2026-11-09T00:00:00.000Z"
    }))
  })

  it("지금 곡 뒤에서 완료한 곡을 건너뛰고 안 끝낸 곡으로 간다", () => {
    expect(nextFeedbackTeamId(ORDER, 2, summary([2, 3]))).toBe(4)
  })

  it("일부만 채운 곡도 안 끝낸 곡이다", () => {
    expect(nextFeedbackTeamId(ORDER, 2, summary([3], [4]))).toBe(4)
  })

  it("뒤에 없으면 앞쪽의 빠뜨린 곡으로 돌아간다", () => {
    expect(nextFeedbackTeamId(ORDER, 5, summary([2, 4, 5]))).toBe(3)
  })

  it("본인 팀으로는 가지 않는다", () => {
    expect(nextFeedbackTeamId(ORDER, 5, summary([2, 3, 4, 5]))).toBeNull()
  })

  it("지금 곡이 안 끝났어도 다른 곡이 없으면 null", () => {
    expect(nextFeedbackTeamId(ORDER, 5, summary([2, 3, 4], [5]))).toBeNull()
  })
})

describe("reviewerProgress / missingReviewsOfTeam", () => {
  // 사용자 11은 팀 1과 팀 2 둘 다 소속 → 해야 할 곳은 팀 3뿐
  const multi: FeedbackContext = {
    targetTeamIds: [1, 2, 3],
    membersByTeam: { 1: [10, 11], 2: [11, 12], 3: [13], 4: [20] }
  }
  const row = (
    teamId: number,
    reviewerId: number,
    s: FeedbackScores = scores(3, 4, 5)
  ) => ({ ...s, teamId, reviewerId })

  it("해야 할 수 = 대상 팀 − 본인 팀, 한 수 = 셀 수 있는 피드백만", () => {
    const rows = [
      row(2, 10),
      row(3, 10, scores(3, null, null)), // 일부만 → 안 한 것
      row(1, 10), // 본인 팀 → 안 셈
      row(4, 10) // 미제출 팀 → 안 셈
    ]
    expect(reviewerProgress(10, multi, rows)).toEqual({ done: 1, required: 2 })
  })

  it("여러 팀 소속이면 그 팀들이 모두 빠진다", () => {
    expect(reviewerProgress(11, multi, [row(3, 11)])).toEqual({
      done: 1,
      required: 1
    })
  })

  it("팀의 빠진 피드백 = 소속자마다 빠진 수의 합", () => {
    // 팀 1: 10은 2개 중 1개 함(1 빠짐), 11은 1개 중 0개(1 빠짐)
    expect(missingReviewsOfTeam(1, multi, [row(2, 10)])).toBe(2)
    // 팀 2: 11(1 빠짐) + 12는 팀 1·3 중 둘 다 함(0)
    expect(
      missingReviewsOfTeam(2, multi, [row(1, 12), row(3, 12), row(2, 10)])
    ).toBe(1)
  })
})

describe("UpsertFeedbackSchema", () => {
  it.each([
    ["teamScore", 10],
    ["individualScore", 10],
    ["preferenceScore", 5]
  ])("%s는 1~%i 정수만 받는다 (구글 폼과 같은 배점)", (key, max) => {
    const accepts = (value: number) =>
      UpsertFeedbackSchema.safeParse({ [key]: value }).success

    expect(accepts(1)).toBe(true)
    expect(accepts(max)).toBe(true)
    expect(accepts(0)).toBe(false)
    expect(accepts(max + 1)).toBe(false)
    expect(accepts(2.5)).toBe(false)
  })

  it("빈 객체는 거부한다", () => {
    expect(UpsertFeedbackSchema.safeParse({}).success).toBe(false)
  })

  it("빈 의견은 null로 바꾼다", () => {
    expect(UpsertFeedbackSchema.parse({ comment: "  " })).toEqual({
      comment: null
    })
  })
})
