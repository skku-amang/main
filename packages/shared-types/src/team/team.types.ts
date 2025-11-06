import { Prisma, Team } from "@repo/database"
import { basicUserSelector, publicUserSelector } from "../user/user.selector"

export type { Team }

export const teamWithBasicUsersInclude = {
  leader: {
    select: basicUserSelector
  },
  teamSessions: {
    include: {
      session: true,
      members: {
        include: {
          user: {
            select: basicUserSelector
          }
        },
        orderBy: {
          index: "asc"
        }
      }
    }
  }
} satisfies Prisma.TeamInclude

export const teamWithPublicUsersInclude = {
  leader: {
    select: publicUserSelector
  },
  teamSessions: {
    include: {
      session: true,
      members: {
        include: {
          user: {
            select: publicUserSelector
          }
        },
        orderBy: {
          index: "asc"
        }
      }
    }
  }
} satisfies Prisma.TeamInclude

type TeamWithBasicUsers = Prisma.TeamGetPayload<{
  include: typeof teamWithBasicUsersInclude
}>

type TeamWithPublicUsers = Prisma.TeamGetPayload<{
  include: typeof teamWithPublicUsersInclude
}>

export type TeamList = TeamWithBasicUsers[]
export type TeamDetail = TeamWithPublicUsers
