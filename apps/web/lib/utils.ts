import { Reservation } from "@/app/(general)/(light)/reservations/_components/MobileReservationField/MobileMyReservationCard"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * `order` 값을 처리하여 소수점 1자리를 포함하고, 그 값이 0인 경우 소수점을 떼고 반환합니다.
 * @param order - 처리할 `order` 값
 * @returns 처리된 `order` 값
 * @example formatGenerationOrder(1.0) // "1"
 */
export function formatGenerationOrder(order: number): string {
  return order % 1 === 0 ? `${Math.floor(order)}` : `${order}`
}

/**
 * `date`와 현재 시간의 차이를 계산하여, 대표적인 상대 시간을 반환합니다.
 * @param date - 대상 날짜
 * @returns 대표적인 상대 시간
 * @example getRepresentativeRelativeTime(new Date()) // "방금"
 */
export function getRepresentativeRelativeTime(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) {
    return `유효하지 않은 날짜`
  }

  const now = new Date()
  const diffTime = now.getTime() - date.getTime()

  const diffSeconds = Math.floor(diffTime / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return `방금`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays === 1) {
    return `어제`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`
  } else if (diffMonths < 12) {
    return `${diffMonths}개월 전`
  } else {
    return `${diffYears}년 전`
  }
}

export function DateSplit(reservation: Reservation) {
  const date = new Date(reservation.start)

  return {
    month: date.getMonth() + 1,
    day: date.getDate(),
    startTime: `${date.getHours()}:${date.getMinutes()}`,
    endTime: `${new Date(reservation.end).getHours()}:${new Date(reservation.end).getMinutes()}`
  }
}
