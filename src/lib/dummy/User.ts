import { User } from "../../../types/User";
import { customFaker } from ".";
import dummyGenerations from "./Generation";
import dummySessions from "./Session";

export const createUser = (id: number): User => ({
  id,
  name: customFaker.person.fullName(),
  nickname: customFaker.internet.userName(),
  email: customFaker.internet.email(),
  bio: customFaker.lorem.sentence(),
  profile_image: customFaker.image.avatar(),
  generation: customFaker.helpers.arrayElement(dummyGenerations),
  sessions: customFaker.helpers.arrayElements(dummySessions, { min: 1, max: 3 }),
})