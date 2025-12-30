import { SessionList } from "@repo/shared-types"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 2배로 저장된 기수를 실제 기수로 변환합니다.
 * @param order - 데이터베이스에 저장된 기수 (예: 46, 47, ..., 74)
 * @returns 실제 기수 (예: "23", "23.5", ..., "37")
 */
export function formatGenerationOrder(order: number): string {
  return (order / 2).toString()
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

export function getSessionIdBySessionName(
  sessionName: string,
  sessions: SessionList
): number {
  const session = sessions.find((s) => s.name === sessionName)
  if (!session) {
    throw new Error(`세션을 찾을 수 없습니다: ${sessionName}`)
  }
  return session.id
}
