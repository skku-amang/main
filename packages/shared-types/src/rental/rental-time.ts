export const RENTAL_MINUTE_STEP = 15

/** 예약 시각의 분 목록. 15분 단위가 아닌 기존 값(keep)은 그대로 고를 수 있게 끼워 넣는다 */
export const minuteOptions = (keep?: number): number[] => {
  const options = Array.from(
    { length: 60 / RENTAL_MINUTE_STEP },
    (_, i) => i * RENTAL_MINUTE_STEP
  )
  if (keep === undefined || options.includes(keep)) return options
  return [...options, keep].sort((a, b) => a - b)
}

export const nextFullHour = (now: Date): Date => {
  const next = new Date(now)
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + 1)
  return next
}

/** 하루 안의 분(0~1439) 두 개 사이를 "1시간 30분"처럼. 종료가 시작보다 늦지 않으면 null */
export const formatDuration = (
  startMinutes: number,
  endMinutes: number
): string | null => {
  const diff = endMinutes - startMinutes
  if (diff <= 0) return null
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  return [hours && `${hours}시간`, minutes && `${minutes}분`]
    .filter(Boolean)
    .join(" ")
}
