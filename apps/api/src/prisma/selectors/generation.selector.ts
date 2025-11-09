import { Prisma } from "@repo/database"

import { basicUser, publicUser } from "./user.selector"

/**
 * 기수의 최소 정보를 선택합니다. (id, order)
 */
export const basicGeneration = {
  id: true,
  order: true
} satisfies Prisma.GenerationSelect

/**
 * 기수 정보와 함께 소속된 유저들의 최소 정보(basicUser)를 선택합니다.
 * 주로 기수 목록 조회에 사용됩니다.
 */
export const generationWithBasicUsers = {
  ...basicGeneration,
  users: {
    select: basicUser
  },
  leader: {
    select: basicUser
  }
} satisfies Prisma.GenerationSelect

/**
 * 기수 정보와 함께 소속된 유저들의 공개 정보(publicUser)를 선택합니다.
 * 주로 `GET /generations/:id`와 같이 특정 기수를 조회하는 API 응답에서 사용됩니다.
 */
export const generationWithPublicUsers = {
  ...basicGeneration,
  users: {
    select: publicUser
  },
  leader: {
    select: publicUser
  }
} satisfies Prisma.GenerationSelect
