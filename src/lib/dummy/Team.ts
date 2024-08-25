import { faker } from "@faker-js/faker";
import { Song, Team } from "../../../types/Team";
import { getRandomSessions } from "./Session";
import { createUser } from "./User";
import { createPerformance } from "./Performance";

export const AJR_MAYBE_MAN_URL = "https://youtu.be/OU24A9C8BUk"

export const createSong = (): Song => ({
  name: faker.lorem.words(),
  artist: faker.person.fullName(),
  cover_name: faker.lorem.words(),
  cover_artist: faker.person.fullName(),
  original_url: AJR_MAYBE_MAN_URL,
  cover_url: AJR_MAYBE_MAN_URL,
  satisfied_sessions: getRandomSessions(),
  unsatisfied_sessions: getRandomSessions(),
});

export const createTeam = (id: number): Team => ({
  id,
  name: faker.company.name(),
  description: faker.lorem.paragraph(),
  is_private: faker.datatype.boolean(),
  leader: createUser(id),
  performance: createPerformance(id),
  song: createSong(),
  is_freshmanFixed: faker.datatype.boolean(),
  posterImage: faker.image.url(),
  youtubeVideo: "https://youtu.be/oL68OY4Lll0?si=LTsLdWpr7Qr7YU9j"    // 24-1 뜨여밤
});