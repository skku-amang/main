import { Performance, Prisma } from "@repo/database"
import { publicUserSelector } from "../user/user.types"

export type { Performance }

export const performanceFindOneInclude = {
  teams: {
    include: {
      teamSessions: true,
      leader: {
        select: publicUserSelector
      }
    }
  }
} satisfies Prisma.PerformanceInclude

export type PerformanceDetail = Prisma.PerformanceGetPayload<{
  include: typeof performanceFindOneInclude
}>

export const performanceTeamsInclude = {
  teams: {
    include: {
      teamSessions: {
        include: {
          session: true,
          members: {
            include: {
              user: {
                select: publicUserSelector
              }
            },
            orderBy: { index: "asc" }
          }
        }
      },
      leader: { select: publicUserSelector }
    }
  }
} satisfies Prisma.PerformanceInclude

type PerformanceWithTeams = Prisma.PerformanceGetPayload<{
  include: typeof performanceTeamsInclude
}>

export type PerformanceTeamsList = PerformanceWithTeams["teams"]

export const PERFORMANCE_STAGES = [
  "PREPARING",
  "RECRUITING",
  "SUBMISSION",
  "EVALUATION",
  "DECISION",
  "LINEUP",
  "DONE"
] as const

export type PerformanceStage = (typeof PERFORMANCE_STAGES)[number]

export const PERFORMANCE_STAGE_LABEL: Record<PerformanceStage, string> = {
  PREPARING: "준비",
  RECRUITING: "팀 모집",
  SUBMISSION: "제출",
  EVALUATION: "피드백",
  DECISION: "집계",
  LINEUP: "공연 준비",
  DONE: "종료"
}

export type PerformanceSchedule = Pick<
  Performance,
  | "recruitStartAt"
  | "recruitEndAt"
  | "feedbackStartAt"
  | "feedbackEndAt"
  | "decidedAt"
  | "endAt"
>

const reached = (at: Date | null, now: Date) => at !== null && now >= at

/**
 * 공연 진행 단계 — 저장하지 않고 날짜에서 계산한다.
 * 날짜가 비어 있으면 그 단계로 넘어가지 않고, 공연 종료가 지나면 무조건 DONE.
 * recruitingPerformanceWhere와 같은 규칙을 유지해야 한다.
 */
export const getPerformanceStage = (
  p: PerformanceSchedule,
  now: Date = new Date()
): PerformanceStage => {
  if (reached(p.endAt, now)) return "DONE"
  if (p.decidedAt) return "LINEUP"
  if (reached(p.feedbackEndAt, now)) return "DECISION"
  if (reached(p.feedbackStartAt, now)) return "EVALUATION"
  if (reached(p.recruitEndAt, now)) return "SUBMISSION"
  if (reached(p.recruitStartAt, now)) return "RECRUITING"
  return "PREPARING"
}

export const isPerformanceRecruiting = (
  p: PerformanceSchedule,
  now: Date = new Date()
) => getPerformanceStage(p, now) === "RECRUITING"

/** 팀 구성(멤버·정원·팀장·삭제)을 바꿀 수 있는 단계 */
export const isTeamRosterOpen = (stage: PerformanceStage) =>
  stage === "RECRUITING"

/** 팀 내용(곡 정보·이름·설명·사진)을 바꿀 수 있는 단계 */
export const isTeamContentOpen = (stage: PerformanceStage) =>
  stage === "RECRUITING" || stage === "SUBMISSION"

export const recruitingPerformanceWhere = (now: Date = new Date()) =>
  ({
    recruitStartAt: { lte: now },
    decidedAt: null,
    AND: [
      { OR: [{ recruitEndAt: null }, { recruitEndAt: { gt: now } }] },
      { OR: [{ feedbackStartAt: null }, { feedbackStartAt: { gt: now } }] },
      { OR: [{ feedbackEndAt: null }, { feedbackEndAt: { gt: now } }] },
      { OR: [{ endAt: null }, { endAt: { gt: now } }] }
    ]
  }) satisfies Prisma.PerformanceWhereInput
