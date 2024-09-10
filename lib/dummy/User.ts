import { faker } from "@faker-js/faker"

import { getRandomSessions } from "@/lib/dummy/Session"
import { DepartmentNames, Position, User } from "@/types/User"

import { customFaker } from "."
import dummyGenerations from "./Generation"

export const createUser = (id: number): User => {
  let fakerWithSeed = faker
  fakerWithSeed.seed(customFaker.seed())

  return {
    id,
    email: customFaker.internet.email(),
    name: customFaker.person.fullName(),
    nickname: customFaker.internet.userName(),
    bio: customFaker.lorem.sentence(),
    profileImage: customFaker.image.avatar(),
    generation: customFaker.helpers.arrayElement(dummyGenerations),
    sessions: getRandomSessions(
      new Map([
        [1, 0.7],
        [2, 0.2],
        [3, 0.1]
      ])
    ),
    position: customFaker.helpers.arrayElement(
      Object.keys(Position) as Position[]
    ),
    department: customFaker.helpers.arrayElement(
      DepartmentNames.map((name, id) => ({
        id,
        name: name as keyof typeof DepartmentNames
      }))
    ),
    genre: fakerWithSeed.music.genre(),
    likedArtists: customFaker.person.firstName(),
    createdDatetime: customFaker.date.past().toISOString(),
    updatedDatetime: customFaker.date.recent().toISOString()
  }
}
