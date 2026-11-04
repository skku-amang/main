"use client"

import {
  FeedbackStatus,
  getFeedbackStatus,
  getPerformanceStage
} from "@repo/shared-types"

import { useMyFeedback } from "@/hooks/api/useFeedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"

const LABEL: Record<FeedbackStatus, string> = {
  DONE: "✔ 피드백 완료",
  PARTIAL: "◐ 피드백 일부만",
  NONE: "피드백 전",
  OWN: "본인 팀",
  NOT_TARGET: "미제출"
}

/** 피드백 단계에서 그 팀에 대한 내 진행 상태. 공연당 요청 하나(같은 키)를 여러 배지가 나눠 쓴다 */
export const useMyFeedbackStatus = (performanceId: number, teamId: number) => {
  const { isAuthenticated } = useAuth()
  const { data: performance } = usePerformance(performanceId)
  const evaluating =
    !!performance && getPerformanceStage(performance) === "EVALUATION"
  const { data: mine } = useMyFeedback(performanceId, {
    enabled: isAuthenticated && evaluating
  })
  if (!evaluating || !mine) return null
  return { status: getFeedbackStatus(teamId, mine), eligible: mine.eligible }
}

const FeedbackStatusBadge = ({
  performanceId,
  teamId,
  className
}: {
  performanceId: number
  teamId: number
  className?: string
}) => {
  const result = useMyFeedbackStatus(performanceId, teamId)
  if (!result?.eligible) return null

  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        result.status === "DONE"
          ? "bg-green-50 text-green-700"
          : result.status === "PARTIAL" || result.status === "NONE"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-500",
        className
      )}
    >
      {LABEL[result.status]}
    </span>
  )
}

export default FeedbackStatusBadge
