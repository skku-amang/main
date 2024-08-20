import { Generation } from "../../types/Generation";
import { Session, SessionName } from "../../types/Session";
import { Song, Team } from "../../types/Team";
import { User } from "../../types/User";
import { Performance } from "../../types/Performance";

export const SESSIONS: Session[] = [
  { name: SessionName.VOCAL },
  { name: SessionName.GUITAR },
  { name: SessionName.BASS },
  { name: SessionName.SYNTH },
  { name: SessionName.DRUM },
]

export const GENERATIONS: Generation[] = [
  { order: 29 },
  { order: 30 },
  { order: 31 },
  { order: 32 },
  { order: 33 },
  { order: 34 },
]

export const USERS: User[] = [
  {
    name: "백경인",
    bio: "백경인 입니다.",
    nickname: "백경인 닉네임",
    profile_image: "https://placehold.co/500/500",
    generation: GENERATIONS[0],
    sessions: [SESSIONS[1]]
  }
]

export const PERFORMANCES: Performance[] = [
  {
    name: "24년 여름방학 정기공연",
    location: "홍대 우주정거장",
    start_datetime: new Date("20240811T17:00"),
    end_datetime: new Date("20240811T20:00")
  }
]

export const SONGS: Song[] = [
  {
    name: "Rosie",
    artist: "John Mayer",
    original_url: "https://youtu.be/Np7A1bT3lrg?si=Nu60RXTEj8LnIbPQ",
    satisfied_sessions: [],
    unsatisfied_sessions: []
  },
]

export const TEAMS: Team[] = [
  {
    name: "장미란",
    leader: USERS[0],
    description: "장미.. 좋아하시나요?",
    is_private: false,
    performance: PERFORMANCES[0],
    song: SONGS[0]
  }
]
