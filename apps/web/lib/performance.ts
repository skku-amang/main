import dayjs from "dayjs"

import {
  getPerformanceStage,
  type Performance,
  type PerformanceSchedule
} from "@repo/shared-types"

export const getRecruitDaysLeft = ({
  recruitEndAt
}: Pick<Performance, "recruitEndAt">) =>
  recruitEndAt
    ? dayjs(recruitEndAt).startOf("day").diff(dayjs().startOf("day"), "day")
    : undefined

export const formatDday = (daysLeft: number) =>
  daysLeft === 0 ? "D-Day" : `D-${daysLeft}`

// 일시 미정은 항상 뒤로
const compareDate = (a: Date | null, b: Date | null, order: 1 | -1) => {
  if (!a || !b) return (a ? 0 : 1) - (b ? 0 : 1)
  return (a.getTime() - b.getTime()) * order
}

// 모집 중은 마감 임박 순, 진행 중은 공연이 가까운 순, 지난 공연은 최근 공연 순
export const splitPerformances = <
  T extends PerformanceSchedule & Pick<Performance, "startAt">
>(
  performances: T[],
  now: Date = new Date()
) => {
  const withStage = performances.map((p) => ({
    p,
    stage: getPerformanceStage(p, now)
  }))
  const recruiting = withStage
    .filter(({ stage }) => stage === "RECRUITING")
    .map(({ p }) => p)
    .sort((a, b) => compareDate(a.recruitEndAt, b.recruitEndAt, 1))
  const ongoing = withStage
    .filter(({ stage }) => stage !== "RECRUITING" && stage !== "DONE")
    .map(({ p }) => p)
    .sort((a, b) => compareDate(a.startAt, b.startAt, 1))
  const past = withStage
    .filter(({ stage }) => stage === "DONE")
    .map(({ p }) => p)
    .sort((a, b) => compareDate(a.startAt, b.startAt, -1))
  return { recruiting, ongoing, past }
}
