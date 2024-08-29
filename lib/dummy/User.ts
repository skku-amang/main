import { faker } from '@faker-js/faker'

import { getRandomSessions } from '@/lib/dummy/Session'

import { User } from '../../types/User'
import { customFaker } from '.'
import dummyGenerations from './Generation'

export const createUser = (id: number): User => {
  let fakerWithSeed = faker
  fakerWithSeed.seed(customFaker.seed())

  return {
    id,
    name: customFaker.person.fullName(),
    nickname: customFaker.internet.userName(),
    email: customFaker.internet.email(),
    bio: customFaker.lorem.sentence(),
    profile_image: customFaker.image.avatar(),
    generation: customFaker.helpers.arrayElement(dummyGenerations),
    sessions: getRandomSessions(
      new Map([
        [1, 0.7],
        [2, 0.2],
        [3, 0.1]
      ])
    ),
    genre: fakerWithSeed.music.genre(),
    liked_artists: customFaker.person.firstName()
  }
}
