import { Performance, Prisma } from "@repo/database"
import { publicUserSelector } from "../user/user.types"

export type { Performance }

export const performanceWithTeamsInclude = {
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
  include: typeof performanceWithTeamsInclude
}>

export const performanceWithTeamMembersInclude = {
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
  include: typeof performanceWithTeamMembersInclude
}>

export type PerformanceTeamsList = PerformanceWithTeams["teams"]
