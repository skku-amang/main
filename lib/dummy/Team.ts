import { SessionName } from "@/types/Session"
import { MemberSession, Song, Team } from "@/types/Team"

import { customFaker } from "."
import { createPerformance } from "./Performance"
import dummySessions from "./Session"
import { createUser } from "./User"

export const AJR_MAYBE_MAN_URL = "https://youtu.be/OU24A9C8BUk"

export const createSong = (): Song => ({
  name: customFaker.lorem.words(),
  artist: customFaker.person.fullName(),
  coverName: customFaker.lorem.words(),
  coverArtist: customFaker.person.fullName(),
  originalUrl: AJR_MAYBE_MAN_URL,
  coverUrl: AJR_MAYBE_MAN_URL
})

export const createTeam = (id: number): Team => ({
  id,
  name: Math.random() < 0.7 ? undefined : customFaker.company.name(),
  description: customFaker.lorem.paragraph(),
  leader: createUser(id),
  performance: createPerformance(id),
  isFreshmanFixed: customFaker.datatype.boolean(),
  posterImage: Math.random() < 0.0 ? undefined : customFaker.image.url(), // 30% 확률로 이미지 없음

  songName: customFaker.lorem.words(),
  songArtist: customFaker.person.fullName(),
  songYoutubeVideoId: "https://youtu.be/oL68OY4Lll0?si=LTsLdWpr7Qr7YU9j", // 24-1 뜨여밤

  createdDatetime: customFaker.date.past().toISOString(),
  updatedDatetime: customFaker.date.recent().toISOString(),

  memberSessions: createMemberSessions()
})

function getRandomValueByProbability(probability: {
  [key: string]: number
}): string {
  // 확률밀도함수 정의
  const keys = Object.keys(probability)
  const values = Object.values(probability)

  // 누적 분포 함수 생성
  const cumulativeProbability: number[] = []
  values.reduce((acc, curr, index) => {
    cumulativeProbability[index] = acc + curr
    return cumulativeProbability[index]
  }, 0)

  // 0과 1 사이의 랜덤 값 생성
  const randomValue = Math.random()

  // 랜덤 값을 특정 값으로 매핑
  for (let i = 0; i < cumulativeProbability.length; i++) {
    if (randomValue < cumulativeProbability[i]) {
      return keys[i]
    }
  }

  // 기본값 반환 (이론적으로는 도달하지 않음)
  return keys[keys.length - 1]
}

function createMemberSessions(): MemberSession[] {
  const probability: { [key: string]: { [key: string]: number } } = {
    [dummySessions[0].name]: {
      0: 0.01,
      1: 0.94,
      2: 0.05
    },
    [dummySessions[1].name]: {
      0: 0.05,
      1: 0.2,
      2: 0.74,
      3: 0.01
    },
    [dummySessions[2].name]: {
      0: 0.03,
      1: 0.97
    },
    [dummySessions[3].name]: {
      0: 0.34,
      1: 0.57,
      2: 0.09
    },
    [dummySessions[4].name]: {
      0: 0.04,
      1: 0.96
    }
  }

  let result: MemberSession[] = []
  Object.entries(probability).map(([session, p], index) => {
    const sessionName = session as SessionName
    const probability = p as { [key: string]: number }
    const memberCount = getRandomValueByProbability(probability)
    const members = Array.from({ length: Number(memberCount) }, () =>
      createUser(Math.floor(Math.random() * 100) + 1)
    )

    result.push({
      id: index,
      session: dummySessions.find((s) => s.name === sessionName)!,
      members,
      requiredMemberCount:
        members.length + (Math.random() < 0.2 ? 1 : Math.random() < 0.1 ? 2 : 0)
    })
  })

  return result
}
