import { Prisma } from "@repo/database"

export const basicUserSelector = {
  id: true,
  name: true,
  image: true,
  generation: {
    select: { id: true, order: true }
  }
} satisfies Prisma.UserSelect

export const publicUserSelector = {
  ...basicUserSelector,
  nickname: true,
  bio: true,
  sessions: {
    select: { id: true, name: true }
  }
} satisfies Prisma.UserSelect

type publicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelector
}>

export type publicUserList = publicUser[]
