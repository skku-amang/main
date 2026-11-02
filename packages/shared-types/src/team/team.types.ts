import { Prisma, Team } from "@repo/database"
import { basicUserSelector, publicUserSelector } from "../user/user.types"

export type { Team }

/** 피드백 기간에 가린 팀장·멤버 자리에 들어가는 사용자 id (실제 사용자 아님) */
export const HIDDEN_USER_ID = 0

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

/** membersHidden: 피드백 기간이라 팀장·멤버가 HIDDEN_USER_ID 자리표시로 바뀐 응답 */
export type TeamList = (TeamWithBasicUsers & { membersHidden?: boolean })[]
export type TeamDetail = TeamWithPublicUsers & { membersHidden?: boolean }
