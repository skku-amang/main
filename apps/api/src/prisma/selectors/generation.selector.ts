import { Prisma } from '@repo/database';
import { minimalUser, basicUser } from './user.selector';

export const basicGeneration = {
  id: true,
  order: true,
} satisfies Prisma.GenerationSelect;

export const generationWithMinimalUsers = {
  ...basicGeneration,
  users: {
    select: minimalUser,
  },
  leader: {
    select: minimalUser,
  },
} satisfies Prisma.GenerationSelect;

export const generationWithBasicUsers = {
  ...basicGeneration,
  users: {
    select: basicUser,
  },
  leader: {
    select: basicUser,
  },
} satisfies Prisma.GenerationSelect;
