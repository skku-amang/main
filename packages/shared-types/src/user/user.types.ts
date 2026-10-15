import { Prisma } from "@repo/database"

export const basicUserSelector = {
  id: true,
  name: true,
  image: true,
  generation: {
    select: { id: true, order: true }
  }
} satisfies Prisma.UserSelect

// 다른 부원에게 보이는 정보. 자기소개(bio)는 본인·관리자(detailed)에게만
export const publicUserSelector = {
  ...basicUserSelector,
  nickname: true,
  sessions: {
    select: { id: true, name: true }
  }
} satisfies Prisma.UserSelect

export const detailedUserSelector = {
  ...publicUserSelector,
  bio: true,
  isProfilePublic: true,
  isAdmin: true,
  email: true,
  isApproved: true
} satisfies Prisma.UserSelect

export type publicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelector
}>
export type publicUserList = publicUser[]

export type DetailedUser = Prisma.UserGetPayload<{
  select: typeof detailedUserSelector
}>
export type DetailedUserList = DetailedUser[]
