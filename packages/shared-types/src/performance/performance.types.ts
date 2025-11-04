import { Prisma, Performance } from "@repo/database"
import { publicUserSelector } from "../user/user.selector"

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

export type PerformanceDetails = Prisma.PerformanceGetPayload<{
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
