export const getRandomItem = <T>(arr: T[]): T => {
  if (arr.length === 0)
    throw new Error("Cannot get random item from empty array")
  return arr[Math.floor(Math.random() * arr.length)]!
}

export const getDate = (days: number, hour: number = 21) => {
  const now = new Date()
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date
}
