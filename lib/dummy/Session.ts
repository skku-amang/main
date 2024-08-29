import { Session, SessionName } from '@/types/Session'

const dummySessions: Session[] = [
  { id: 0, name: SessionName.VOCAL },
  { id: 1, name: SessionName.GUITAR },
  { id: 2, name: SessionName.BASS },
  { id: 3, name: SessionName.SYNTH },
  { id: 4, name: SessionName.DRUM },
]

export default dummySessions

type ProbabilityDensity = Map<number, number>
const getTotalProbability = (pd: ProbabilityDensity): number => {
  let total = 0
  for (const value of pd.values()) {
    total += value
  }
  return total
}

const getRandomKey = (pd: ProbabilityDensity): number => {
  const total = getTotalProbability(pd)
  const random = Math.random() * total
  let cumulative = 0
  for (const [key, value] of pd.entries()) {
    cumulative += value
    if (random <= cumulative) {
      return key
    }
  }
  return -1 // Return -1 if probability density is empty or invalid
}

/**
 * pd에 따라 세션을 랜덤하게 반환합니다.
 * @param pd 확률 밀도: key는 세션의 개수, value는 그 세션의 확률
 * @example   
 * // 1개의 세션을 50% 확률로, 2개의 세션을 30% 확률로, 3개의 세션을 20% 확률로 반환   
 * getRandomSessions(new Map([[1, 0.5], [2, 0.3], [3, 0.2]]))
 */
export const getRandomSessions = (pd: ProbabilityDensity): Session[] => {
  // TODO: @/lib/dummy/Team.ts의 코드로 대체
  const count = getRandomKey(pd)
  const shuffledSessions = [...dummySessions].sort(() => Math.random() - 0.5)
  return shuffledSessions.slice(0, count)
}