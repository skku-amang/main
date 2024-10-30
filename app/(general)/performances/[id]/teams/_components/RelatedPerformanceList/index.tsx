import ButtonView from "@/app/(general)/performances/[id]/teams/_components/RelatedPerformanceList/ButtonView"
import SelectView from "@/app/(general)/performances/[id]/teams/_components/RelatedPerformanceList/SelectView"
import { Performance } from "@/types/Performance"

interface RelatedPerformanceListProps {
  currentPerformanceId: number
  relatedPerformances: Performance[]
}

const RelatedPerformanceList = ({
  currentPerformanceId,
  relatedPerformances
}: RelatedPerformanceListProps) => {
  return (
    <div>
      <div className="hidden lg:block">
        <ButtonView
          currentPerformanceId={currentPerformanceId}
          performanceOptions={relatedPerformances}
        />
      </div>

      {/* 모바일: Select 보기 */}
      <div className="lg:hidden">
        <SelectView
          currentPerformanceId={currentPerformanceId}
          performanceOptions={relatedPerformances}
        />
      </div>
    </div>
  )
}

export default RelatedPerformanceList
