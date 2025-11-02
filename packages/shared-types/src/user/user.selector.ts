import { Prisma } from "@repo/database"

export const basicUserSelector = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  image: true
})

export const publicUserSelector = Prisma.validator<Prisma.UserSelect>()({
  ...basicUserSelector,
  nickname: true,
  bio: true
})
