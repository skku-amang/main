"use client"

import Link from "next/link"

import FeedbackStatusBadge, {
  useMyFeedbackStatus
} from "@/components/FeedbackStatusBadge"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"

/** 피드백 단계에서만: 내 진행 상태 + 이 팀 피드백으로 바로 가기 */
const FeedbackEntry = ({
  performanceId,
  teamId
}: {
  performanceId: number
  teamId: number
}) => {
  const result = useMyFeedbackStatus(performanceId, teamId)
  if (!result?.eligible) return null
  const canReview = result.status !== "OWN" && result.status !== "NOT_TARGET"

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-5 py-4 shadow-[0_4px_30px_0_rgba(59,130,246,0.07)]">
      <FeedbackStatusBadge performanceId={performanceId} teamId={teamId} />
      {canReview && (
        <Button asChild size="sm">
          <Link href={ROUTES.PERFORMANCE.FEEDBACK(performanceId, teamId)}>
            피드백 남기기 →
          </Link>
        </Button>
      )}
    </div>
  )
}

export default FeedbackEntry
