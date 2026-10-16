import dayjs from "dayjs"

import { isPerformanceRecruiting } from "@repo/shared-types"

interface PerformanceDates {
  startAt: Date | null
  endAt: Date | null
}

// 모집 마감 = 공연 종료 일시 (isPerformanceRecruiting과 같은 기준)
export const getRecruitDaysLeft = ({
  endAt
}: Pick<PerformanceDates, "endAt">) =>
  endAt
    ? dayjs(endAt).startOf("day").diff(dayjs().startOf("day"), "day")
    : undefined

export const formatDday = (daysLeft: number) =>
  daysLeft === 0 ? "D-Day" : `D-${daysLeft}`

// 일시 미정은 항상 뒤로
const compareDate = (a: Date | null, b: Date | null, order: 1 | -1) => {
  if (!a || !b) return (a ? 0 : 1) - (b ? 0 : 1)
  return (a.getTime() - b.getTime()) * order
}

// 모집 중은 마감 임박 순, 지난 공연은 최근 공연 순
export const splitPerformances = <T extends PerformanceDates>(
  performances: T[]
) => {
  const recruiting = performances
    .filter((p) => isPerformanceRecruiting(p))
    .sort((a, b) => compareDate(a.endAt, b.endAt, 1))
  const past = performances
    .filter((p) => !isPerformanceRecruiting(p))
    .sort((a, b) => compareDate(a.startAt, b.startAt, -1))
  return { recruiting, past }
}
