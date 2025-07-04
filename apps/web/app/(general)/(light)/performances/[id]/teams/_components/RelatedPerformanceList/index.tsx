import ButtonView from "@/app/(general)/(light)/performances/[id]/teams/_components/RelatedPerformanceList/ButtonView"
import SelectView from "@/app/(general)/(light)/performances/[id]/teams/_components/RelatedPerformanceList/SelectView"
import { Performance } from "@/types/Performance"

interface RelatedPerformanceListProps {
  currentPerformanceId: number
  relatedPerformances: Performance[]
  className?: string
}

const RelatedPerformanceList = ({
  currentPerformanceId,
  relatedPerformances,
  className
}: RelatedPerformanceListProps) => {
  return (
    <div className={className}>
      <div className="hidden md:block">
        <ButtonView
          currentPerformanceId={currentPerformanceId}
          performanceOptions={relatedPerformances}
        />
      </div>

      {/* 모바일: Select 보기 */}
      <div className="md:hidden">
        <SelectView
          currentPerformanceId={currentPerformanceId}
          performanceOptions={relatedPerformances}
        />
      </div>
    </div>
  )
}

export default RelatedPerformanceList
