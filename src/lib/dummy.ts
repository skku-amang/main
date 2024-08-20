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
    bio: "너 왤케 친절해",
    nickname: "백종ㅇ.... 죄송합니다",
    profile_image: "https://placehold.co/500/500",
    generation: GENERATIONS[0],
    sessions: [SESSIONS[1]]
  },
  {
    name: "최은",
    bio: "너 노래 왤케잘해",
    nickname: "Silver?",
    profile_image: "https://placehold.co/500/500",
    generation: GENERATIONS[0],
    sessions: [SESSIONS[0]]
  },
  {
    name: "손장수",
    bio: "장수하셈",
    nickname: "학점폭탄",
    profile_image: "https://placehold.co/500/500",
    generation: GENERATIONS[5],
    sessions: [SESSIONS[3]]
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
    satisfied_sessions: [SESSIONS[1], SESSIONS[2]],
    unsatisfied_sessions: []
  },
  {
    name: "Yesterday",
    artist: "Official髭男dism",
    original_url: "https://youtu.be/DuMqFknYHBs?si=HX04j9nZoKypgemI",
    satisfied_sessions: [SESSIONS[0], SESSIONS[3]],
    unsatisfied_sessions: [SESSIONS[1], SESSIONS[2]]
  },
  {
    name: "Maybe Man",
    artist: "AJR",
    original_url: "https://youtu.be/OU24A9C8BUk?si=56lEAVXrpMFFRtsO",
    satisfied_sessions: [SESSIONS[3]],
    unsatisfied_sessions: [SESSIONS[1], SESSIONS[2]]
  },
]

export const TEAMS: Team[] = [
  {
    id: 0,
    name: "장미란",
    leader: USERS[0],
    description: "장미.. 좋아하시나요?",
    is_private: false,
    performance: PERFORMANCES[0],
    song: SONGS[0],
    is_freshmanFixed: false
  },
  {
    id: 1,
    name: "스물다섯다섯스물셋하나",
    leader: USERS[1],
    description: "아니 어떻게 스물다섯이 다섯명이지???",
    is_private: false,
    performance: PERFORMANCES[0],
    song: SONGS[1],
    is_freshmanFixed: false
  },
  {
    id: 2,
    name: "Long Life",
    leader: USERS[2],
    description: "응 내맘대로 할거야",
    is_private: false,
    performance: PERFORMANCES[0],
    song: SONGS[2],
    is_freshmanFixed: true
  },
]
