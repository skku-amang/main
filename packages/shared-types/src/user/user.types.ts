import { Prisma, User } from "@repo/database"

export type { User }

export const userWithBasicGenerationInclude = {
  generation: {
    select: {
      id: true,
      order: true
    }
  }
} satisfies Prisma.UserInclude

export const userWithJoinedTeams = {
  generation: {
    select: {
      id: true,
      order: true
    }
  },
  joinedTeams: {
    include: {
      teamSession: {
        include: {
          team: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} satisfies Prisma.UserInclude

type UserWithBasicUsers = Prisma.UserGetPayload<{
  include: typeof userWithBasicGenerationInclude
}>

type UserWithJoinedTeams = Prisma.UserGetPayload<{
  include: typeof userWithJoinedTeams
}>

export type UserList = UserWithBasicUsers[]
export type UserDetail = UserWithJoinedTeams
