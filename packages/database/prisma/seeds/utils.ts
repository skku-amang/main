export const getRandomItem = <T>(arr: T[]): T => {
  if (arr.length === 0)
    throw new Error("Cannot get random item from empty array")
  return arr[Math.floor(Math.random() * arr.length)]!
}

export const getRandomItems = <T>(arr: T[], count: number): T[] => {
  if (arr.length === 0)
    throw new Error("Cannot get random items from empty array")
  if (arr.length < count)
    throw new Error("Count cannot be larger than array length")

  const shuffled = [...arr]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[j], shuffled[i]] = [shuffled[i]!, shuffled[j]!]
  }

  return shuffled.slice(0, count)
}

export const getDate = (days: number, hour: number = 21) => {
  const now = new Date()
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date
}

export const getRandomInt = (min: number, max: number) => {
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

export const getRandomBoolean = (probability: number = 0.5): boolean =>
  Math.random() < probability
