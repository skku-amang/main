import { Prisma } from "@repo/database"

export const basicUserSelector = {
  id: true,
  name: true,
  image: true
} satisfies Prisma.UserSelect

export const publicUserSelector = {
  ...basicUserSelector,
  nickname: true,
  bio: true
} satisfies Prisma.UserSelect
