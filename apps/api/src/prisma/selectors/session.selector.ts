import { Prisma } from "@repo/database"
import { basicUser, publicUser } from "./user.selector"

/**
 * 세션의 최소 정보를 선택합니다. (id, name, icon)
 */
export const basicSession = {
  id: true,
  name: true,
  icon: true
} satisfies Prisma.SessionSelect

/**
 * 세션 정보와 함께 소속된 유저들의 최소 정보(basicUser)를 선택합니다.
 * 주로 세션 목록 조회에 사용됩니다.
 */
export const sessionWithBasicUsers = {
  ...basicSession,
  users: {
    select: basicUser
  },
  leader: {
    select: basicUser
  }
} satisfies Prisma.SessionSelect

/**
 * 세션 정보와 함께 소속된 유저들의 공개 정보(publicUser)를 선택합니다.
 * 주로 `GET /sessions/:id`와 같이 특정 세션을 조회하는 API 응답에서 사용됩니다.
 */
export const sessionWithPublicUsers = {
  ...basicSession,
  users: {
    select: publicUser
  },
  leader: {
    select: publicUser
  }
} satisfies Prisma.SessionSelect
