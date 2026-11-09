import type { PerformanceStage } from "../performance/performance.types"

export const FEEDBACK_SCORE_MIN = 1
export const FEEDBACK_COMMENT_MAX = 2000

/** 문항은 고정 (설계 5.2). 폼·계산·집계 화면이 전부 이 배열을 돈다. weight = 32기 스크립트 2:2:1, max·hint = 구글 폼 */
export const FEEDBACK_DIMENSIONS = [
  {
    key: "teamScore",
    label: "팀 완성도",
    weight: 2,
    max: 10,
    hint: "박자, 악기들의 합, 구성 등을 고려한 전체적인 완성도"
  },
  {
    key: "individualScore",
    label: "개인 완성도",
    weight: 2,
    max: 10,
    hint: "각 악기의 숙련도에 점수를 매긴 뒤, 그 평균에 해당하는 점수"
  },
  {
    key: "preferenceScore",
    label: "선호도",
    weight: 1,
    max: 5,
    hint: "실력과 무관한 개인 기호. 공연에 오르면 좋을 곡, 관객 호응이 좋을 곡, 좋아하는 장르 등"
  }
] as const

export type FeedbackDimensionKey = (typeof FEEDBACK_DIMENSIONS)[number]["key"]

export type FeedbackScores = Record<FeedbackDimensionKey, number | null>

/** 세 점수가 모두 있어야 완료. 일부만 채운 행은 안 쓴 것과 같다 */
export const isFeedbackComplete = (row: FeedbackScores) =>
  FEEDBACK_DIMENSIONS.every(({ key }) => row[key] !== null)

export const missingDimensions = (
  row: FeedbackScores | undefined
): FeedbackDimensionKey[] =>
  FEEDBACK_DIMENSIONS.filter(({ key }) => !row || row[key] === null).map(
    ({ key }) => key
  )

/** 지금 기준의 대상 팀(녹음본 있음)과 팀별 소속자(팀장 ∪ 세션 멤버) */
export type FeedbackContext = {
  targetTeamIds: number[]
  membersByTeam: Record<number, number[]>
}

const teamsOf = (userId: number, ctx: FeedbackContext) =>
  Object.entries(ctx.membersByTeam)
    .filter(([, members]) => members.includes(userId))
    .map(([teamId]) => Number(teamId))

/** 대상 팀 중 하나 이상의 소속자 */
export const isEligibleReviewer = (userId: number, ctx: FeedbackContext) =>
  teamsOf(userId, ctx).some((teamId) => ctx.targetTeamIds.includes(teamId))

/**
 * 셀 수 있는 피드백 = 완료 ∧ 지금 대상 팀 ∧ 작성자가 지금 자격 있음 ∧ 지금 본인 팀 아님.
 * 날짜를 되돌려 조건이 바뀐 행은 지우지 않고 여기서 거른다 (설계 5.2).
 * 진행률·배지·미참여·점수 계산이 모두 이 함수만 쓴다.
 */
export const isCountableFeedback = (
  row: FeedbackScores & { teamId: number; reviewerId: number },
  ctx: FeedbackContext
) =>
  isFeedbackComplete(row) &&
  ctx.targetTeamIds.includes(row.teamId) &&
  isEligibleReviewer(row.reviewerId, ctx) &&
  !teamsOf(row.reviewerId, ctx).includes(row.teamId)

/** GET /performances/:id/feedback/mine 응답 */
export type MyFeedbackSummary = {
  stage: PerformanceStage
  eligible: boolean
  /** 그 공연에서 내가 소속된 팀 (대상이 아닌 팀 포함) */
  ownTeamIds: number[]
  targetTeamIds: number[]
  feedbacks: (FeedbackScores & {
    teamId: number
    comment: string | null
    updatedAt: string
  })[]
}

export type FeedbackStatus = "DONE" | "PARTIAL" | "NONE" | "OWN" | "NOT_TARGET"

export const getFeedbackStatus = (
  teamId: number,
  mine: MyFeedbackSummary
): FeedbackStatus => {
  if (mine.ownTeamIds.includes(teamId)) return "OWN"
  if (!mine.targetTeamIds.includes(teamId)) return "NOT_TARGET"
  const row = mine.feedbacks.find((f) => f.teamId === teamId)
  if (!row) return "NONE"
  return isFeedbackComplete(row) ? "DONE" : "PARTIAL"
}

/** 피드백 곡 순서. 사람마다 섞을지는 운영진 질문(설계 7절) — 바꾸면 여기만 */
export const orderFeedbackTeams = <
  T extends { id: number; createdAt: Date | string }
>(
  teams: T[]
): T[] =>
  [...teams].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
      a.id - b.id
  )
