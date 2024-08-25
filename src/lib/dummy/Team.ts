import { faker } from "@faker-js/faker";
import { Song, Team } from "../../../types/Team";
import dummySessions, { getRandomSessions } from "./Session";
import { createUser } from "./User";
import { createPerformance } from "./Performance";

export const createSong = (): Song => ({
  name: faker.lorem.words(),
  artist: faker.person.fullName(),
  cover_name: faker.lorem.words(),
  cover_artist: faker.person.fullName(),
  original_url: faker.internet.url(),
  cover_url: faker.internet.url(),
  satisfied_sessions: getRandomSessions(),
  unsatisfied_sessions: getRandomSessions()
});

export const createTeam = (id: number): Team => ({
  id,
  name: faker.company.name(),
  description: faker.lorem.paragraph(),
  is_private: faker.datatype.boolean(),
  leader: createUser(id),
  performance: createPerformance(id),
  song: createSong(),
  is_freshmanFixed: faker.datatype.boolean()
});