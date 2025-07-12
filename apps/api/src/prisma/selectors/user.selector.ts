import { Prisma } from '@repo/database';
import { basicGeneration } from './generation.selector';

export const minimalUser = {
  id: true,
  name: true,
  nickname: true,
} satisfies Prisma.UserSelect;

export const basicUser = {
  ...minimalUser,
  name: true,
} satisfies Prisma.UserSelect;

export const publicUser = {
  ...basicUser,
  bio: true,
  image: true,
} satisfies Prisma.UserSelect;

export const privateUser = {
  ...publicUser,
  isAdmin: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userWithGeneration = {
  ...publicUser,
  generation: {
    select: basicGeneration,
  },
} satisfies Prisma.UserSelect;
