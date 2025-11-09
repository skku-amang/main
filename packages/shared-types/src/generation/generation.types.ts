import { Prisma, Generation } from "@repo/database"
import { basicUserSelector, publicUserSelector } from "../user/user.selector"

export type { Generation }

export const basicGenerationSelector = {
  id: true,
  order: true
} satisfies Prisma.GenerationSelect

export const generationWithBasicUsersSelector = {
  ...basicGenerationSelector,
  users: {
    select: basicUserSelector
  },
  leader: {
    select: basicUserSelector
  }
} satisfies Prisma.GenerationSelect

export const generationWithPublicUsersSelector = {
  ...basicGenerationSelector,
  users: {
    select: publicUserSelector
  },
  leader: {
    select: publicUserSelector
  }
} satisfies Prisma.GenerationSelect

export type GenerationWithBasicUsers = Prisma.GenerationGetPayload<{
  select: typeof generationWithBasicUsersSelector
}>

export type GenerationWithPublicUsers = Prisma.GenerationGetPayload<{
  select: typeof generationWithPublicUsersSelector
}>

export type GenerationList = GenerationWithBasicUsers[]
export type GenerationDetail = GenerationWithPublicUsers
