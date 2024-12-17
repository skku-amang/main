import { ArrowRight, ChevronLeft } from "lucide-react"
import React from "react"
import { GoDot, GoDotFill } from "react-icons/go"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      className={cn(`h-8 md:h-10 rounded-none text-xs md:text-md p-2 md:p-4 text-secondary disabled:text-gray-500 font-semibold`, mode === "next" ? "border-2 border-secondary" : "border-none", className)}
      variant="outline"
      disabled={isFirst && mode === "prev"}
      onClick={onClick}
      type="button"
    >
      {mode === "prev" && <ChevronLeft className="me-2 w-4 h-4 md:w-6 md:h-6 text-mainText" />}
      {mode === "prev" ? "Back" : !isLast ? "Next" : "Complete"}
      {mode === "next" && !isLast && <ArrowRight className="ms-2 w-4 h-4 md:w-6 md:h-6 text-secondary" />}
    </Button>
  )
}

interface PaginatorProps {
  onPrevious?: () => void
  onNext?: () => void
  totalPage: number
  currentPage: number
}

const Paginator = ({
  onPrevious,
  onNext,
  totalPage,
  currentPage
}: PaginatorProps) => {
  return (
    <div className="mt-24 flex items-center justify-between">
      {/* 이전 버튼 */}
      <PaginatorButton
        isFirst={currentPage === 1}
        onClick={onPrevious}
        mode="prev"
        />

      <div className="flex items-center gap-x-1 md:gap-x-3">
        {Array.from({ length: totalPage }).map((_, index) =>
          currentPage === index + 1 ? (
            <GoDotFill key={index} size={28} className="text-primary w-4 h-4 md:w-7 md:h-7" />
          ) : (
            <GoDot key={index} size={28} className="text-gray-500 w-4 h-4 md:w-7 md:h-7" />
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
