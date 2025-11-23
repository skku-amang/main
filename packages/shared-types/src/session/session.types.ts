import { BandSessionName, Prisma } from "@repo/database"
import { basicUserSelector, publicUserSelector } from "../user/user.selector"

export type { BandSessionName }

const basicSessionSelector = {
  id: true,
  name: true,
  icon: true
} satisfies Prisma.SessionSelect

export const sessionWithBasicUsersSelector = {
  ...basicSessionSelector,
  users: { select: basicUserSelector },
  leader: { select: basicUserSelector }
} satisfies Prisma.SessionSelect

export const sessionWithPublicUsersSelector = {
  ...basicSessionSelector,
  users: { select: publicUserSelector },
  leader: { select: publicUserSelector }
} satisfies Prisma.SessionSelect

export type SessionWithBasicUsers = Prisma.SessionGetPayload<{
  select: typeof sessionWithBasicUsersSelector
}>

export type SessionWithPublicUsers = Prisma.SessionGetPayload<{
  select: typeof sessionWithPublicUsersSelector
}>

export type SessionList = SessionWithBasicUsers[]
export type SessionDetail = SessionWithPublicUsers
