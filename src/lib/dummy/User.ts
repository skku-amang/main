import { faker } from "@faker-js/faker";

import { User } from "../../../types/User";
import dummyGenerations from "./Generation";
import { getRandomSessions } from "./Session";

export const createUser = (id: number): User => ({
  id,
  name: faker.person.fullName(),
  nickname: faker.internet.userName(),
  email: faker.internet.email(),
  bio: faker.lorem.sentence(),
  profile_image: faker.image.avatar(),
  generation: faker.helpers.arrayElement(dummyGenerations),
  sessions: getRandomSessions(new Map([[1, 0.7], [2, 0.2], [3, 0.1]])),
  genre: faker.music.genre(),
  liked_artists: faker.person.firstName()
})