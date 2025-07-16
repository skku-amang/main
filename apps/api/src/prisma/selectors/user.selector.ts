import { Prisma } from '@repo/database';
import { basicGeneration } from './generation.selector';

/**
 * 유저의 최소 정보(id, 이름, 닉네임)를 선택합니다.
 * 해당 select는 주로 목록 조회에 사용됩니다.
 */
export const basicUser = {
  id: true,
  name: true,
  nickname: true,
} satisfies Prisma.UserSelect;

/**
 * 외부에 공개 가능한 유저 정보를 선택합니다.
 * 주로 `GET /users/:id`와 같이 특정 유저를 조회하는 API 응답에서 사용됩니다.
 */
export const publicUser = {
  ...basicUser,
  bio: true,
  image: true,
} satisfies Prisma.UserSelect;

/**
 * 민감한 정보를 포함한 유저의 모든 정보를 선택합니다. (주로 관리자용)
 */
export const privateUser = {
  ...publicUser,
  isAdmin: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

/**
 * 유저의 공개 정보와 함께 소속된 기수의 기본 정보를 선택합니다.
 */
export const userWithGeneration = {
  ...publicUser,
  generation: {
    select: basicGeneration,
  },
} satisfies Prisma.UserSelect;
