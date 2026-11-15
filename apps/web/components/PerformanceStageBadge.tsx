import { badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getPerformanceStage,
  PERFORMANCE_STAGE_LABEL,
  type PerformanceSchedule,
  type PerformanceStage
} from "@repo/shared-types"

// 부원이 할 일이 있는 단계는 진하게, 진행 중은 옅게, 시작 전·끝은 회색
const ACTION = "border-transparent bg-primary text-primary-foreground"
const PROGRESS = "border-blue-200 bg-blue-50 text-primary"
const IDLE = "border-slate-200 bg-slate-100 text-slate-500"

const STAGE_TONE: Record<PerformanceStage, string> = {
  PREPARING: IDLE,
  RECRUITING: ACTION,
  SUBMISSION: PROGRESS,
  EVALUATION: ACTION,
  DECISION: PROGRESS,
  LINEUP: PROGRESS,
  DONE: IDLE
}

const PerformanceStageBadge = ({
  performance,
  className
}: {
  performance: PerformanceSchedule
  className?: string
}) => {
  const stage = getPerformanceStage(performance)
  return (
    // span — 공연 선택(Select) 항목 안에도 들어가서 div를 쓰면 안 됨
    <span
      className={cn(
        badgeVariants({ variant: "outline" }),
        STAGE_TONE[stage],
        className
      )}
    >
      {PERFORMANCE_STAGE_LABEL[stage]}
    </span>
  )
}

export default PerformanceStageBadge
