import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getPerformanceStage,
  PERFORMANCE_STAGE_LABEL,
  type PerformanceSchedule
} from "@repo/shared-types"

const PerformanceStageBadge = ({
  performance,
  className
}: {
  performance: PerformanceSchedule
  className?: string
}) => (
  <Badge variant="secondary" className={cn("shrink-0", className)}>
    {PERFORMANCE_STAGE_LABEL[getPerformanceStage(performance)]}
  </Badge>
)

export default PerformanceStageBadge
