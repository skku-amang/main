import { ArrowRight, ChevronLeft } from "lucide-react"
import { GoDot, GoDotFill } from "react-icons/go"

import { cn } from "@/lib/utils"
import { Button } from "@repo/ui/button"

const PaginatorButton = ({
  isFirst,
  isLast,
  onClick,
  className,
  mode
}: {
  isFirst?: boolean
  isLast?: boolean
  onClick?: () => void
  className?: string
  mode: "next" | "prev"
}) => {
  return (
    <Button
      className={cn(
        `md:text-md h-8 rounded-none p-4 text-xs font-semibold text-secondary disabled:text-gray-500 md:h-10`,
        mode === "next" ? "border-2 border-secondary" : "border-none",
        className
      )}
      variant="outline"
      disabled={isFirst && mode === "prev"}
      onClick={onClick}
      type="button"
    >
      {mode === "prev" && (
        <ChevronLeft className="me-2 h-4 w-4 text-mainText md:h-6 md:w-6" />
      )}
      {mode === "prev" ? "Back" : !isLast ? "Next" : "Complete"}
      {mode === "next" && !isLast && (
        <ArrowRight className="ms-2 h-4 w-4 text-secondary md:h-6 md:w-6" />
      )}
    </Button>
  )
}

interface PaginatorProps {
  onPrevious?: () => void
  onNext?: () => void
  totalPage: number
  currentPage: number
  className?: string
}

const Paginator = ({
  onPrevious,
  onNext,
  totalPage,
  currentPage,
  className
}: PaginatorProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* 이전 버튼 */}
      <PaginatorButton
        isFirst={currentPage === 1}
        onClick={onPrevious}
        mode="prev"
      />

      <div className="flex items-center gap-x-1 md:gap-x-3">
        {Array.from({ length: totalPage }).map((_, index) =>
          currentPage === index + 1 ? (
            <GoDotFill
              key={index}
              size={28}
              className="h-4 w-4 text-primary md:h-7 md:w-7"
            />
          ) : (
            <GoDot
              key={index}
              size={28}
              className="h-4 w-4 text-gray-500 md:h-7 md:w-7"
            />
          )
        )}
      </div>

      {/* 다음 버튼 */}
      <PaginatorButton
        isLast={totalPage === currentPage}
        onClick={onNext}
        mode="next"
      />
    </div>
  )
}

export default Paginator
