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

/**
 * 팀 모집 중인 공연 판정 — endAt이 지나지 않았거나 비어 있으면 모집 중.
 * 공연 라이프사이클(PerformanceStatus) 도입 전까지의 기준이며,
 * recruitingPerformanceWhere와 같은 규칙을 유지해야 한다.
 */
export const isPerformanceRecruiting = (
  performance: Pick<Performance, "endAt">,
  now: Date = new Date()
) => performance.endAt === null || performance.endAt > now

export const recruitingPerformanceWhere = (now: Date = new Date()) =>
  ({
    OR: [{ endAt: null }, { endAt: { gt: now } }]
  }) satisfies Prisma.PerformanceWhereInput
