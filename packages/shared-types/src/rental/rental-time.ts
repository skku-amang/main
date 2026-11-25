export const RENTAL_MINUTE_STEP = 30

export const nextFullHour = (now: Date): Date => {
  const next = new Date(now)
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + 1)
  return next
}

/** 두 시점(분) 사이를 "1일 3시간 30분"처럼. 종료가 시작보다 늦지 않으면 null */
export const formatDuration = (
  startMinutes: number,
  endMinutes: number
): string | null => {
  const diff = endMinutes - startMinutes
  if (diff <= 0) return null
  const days = Math.floor(diff / (24 * 60))
  const hours = Math.floor((diff % (24 * 60)) / 60)
  const minutes = diff % 60
  return [
    days && `${days}일`,
    hours && `${hours}시간`,
    minutes && `${minutes}분`
  ]
    .filter(Boolean)
    .join(" ")
}
