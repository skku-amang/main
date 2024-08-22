import { Session, SessionName } from "../../../types/Session";

const dummySessions: Session[] = [
  { name: SessionName.VOCAL },
  { name: SessionName.GUITAR },
  { name: SessionName.BASS },
  { name: SessionName.SYNTH },
  { name: SessionName.DRUM },
]

/**
 * @returns 0~3개의 랜덤 세션
 */
export const getRandomSessions = (): Session[] => {
  const random = Math.random();
  let count = 3
  if (random < 0.50) count = 0
  else if (random < 0.80) count = 1
  else if (random < 0.95) count = 2

  const shuffledSessions = [...dummySessions].sort(() => Math.random() - 0.5);
  if (count === 0) {
    return []
  }
  return shuffledSessions.slice(0, count);
};

export default dummySessions