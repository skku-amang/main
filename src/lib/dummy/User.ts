import { faker } from "@faker-js/faker";
import { User } from "../../../types/User";
import { getRandomSessions, getRandomSessions_atleast1 } from "./Session";
import dummyGenerations from "./Generation";

export const createUser = (id: number): User => ({
  id,
  name: faker.person.fullName(),
  nickname: faker.internet.userName(),
  email: faker.internet.email(),
  bio: faker.lorem.sentence(),
  profile_image: faker.image.avatar(),
  generation: faker.helpers.arrayElement(dummyGenerations),
  sessions: getRandomSessions_atleast1(),
  genre: faker.music.genre(),
  artist_like: faker.person.firstName()
})