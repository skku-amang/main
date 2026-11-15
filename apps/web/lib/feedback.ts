import { PerformanceStage } from "@repo/shared-types"
import dayjs from "dayjs"

const HOUR = 60 * 60 * 1000

const untilText = (ms: number) => {
  const days = Math.floor(ms / (24 * HOUR))
  const hours = Math.floor((ms % (24 * HOUR)) / HOUR)
  if (days > 0) return `${days}일 ${hours}시간`
  if (hours > 0) return `${hours}시간`
  return `${Math.max(1, Math.ceil(ms / 60000))}분`
}

/** 단계에 맞춰 피드백 시작·마감까지 남은 시간. 마감 24시간 전부터 강조 */
export const feedbackDeadline = (
  stage: PerformanceStage | undefined,
  startAt: Date | string | null | undefined,
  endAt: Date | string | null | undefined
) => {
  if (!stage || !endAt) return null
  const end = dayjs(endAt)
  const at = (d: dayjs.Dayjs) => d.format("M월 D일 HH:mm")
  if (["PREPARING", "RECRUITING", "SUBMISSION"].includes(stage) && startAt) {
    const start = dayjs(startAt)
    return {
      text: `피드백 시작까지 ${untilText(start.diff(dayjs()))} (${at(start)})`,
      urgent: false
    }
  }
  if (stage === "EVALUATION") {
    const ms = end.diff(dayjs())
    return {
      text: `마감까지 ${untilText(ms)} (${at(end)})`,
      urgent: ms < 24 * HOUR
    }
  }
  return { text: `피드백 마감됨 (${at(end)})`, urgent: false }
}
