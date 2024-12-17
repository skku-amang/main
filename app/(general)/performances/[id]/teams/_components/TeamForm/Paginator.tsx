import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react"
import React from "react"
import { GoDot, GoDotFill } from "react-icons/go"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PaginatorButton = ({
  disabled,
  onClick,
  className,
  mode
}: {
  disabled: boolean
  onClick?: () => void
  className?: string
  mode: "next" | "prev"
}) => {
  return (
    <Button
      className={cn(`h-8 md:h-12 rounded-none text-xs md:text-md p-2`, className)}
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {mode === "prev" && <ChevronLeft className="me-2 w-4 h-4 md:w-6 md:h-6 text-mainText" />}
      {mode === "prev" && <span className="text-mainText">Back</span>}
      {mode === "next" && <span className="text-secondary">Next</span>}
      {mode === "next" && <ArrowRight className="ms-2 w-4 h-4 md:w-6 md:h-6 text-secondary" />}
    </Button>
  )
}

interface PaginatorProps {
  onPrevious?: () => void
  onNext?: () => void
  isPrevButtonDisabled?: boolean
  isNextButtonDisabled?: boolean
  totalPage: number
  currentPage: number
}

const Paginator = ({
  onPrevious,
  onNext,
  isPrevButtonDisabled,
  isNextButtonDisabled,
  totalPage,
  currentPage
}: PaginatorProps) => {
  isPrevButtonDisabled = currentPage === 1
  isNextButtonDisabled = totalPage === currentPage

  return (
    <div className="mt-24 flex items-center justify-between">
      {/* 이전 버튼 */}
      <PaginatorButton
        className="h-12 rounded-none text-gray-500 font-semibold disabled:border-none"
        disabled={isPrevButtonDisabled}
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
        className="h-12 rounded-none border-2 border-secondary text-secondary font-semibold"
        disabled={isNextButtonDisabled}
        onClick={onNext}
        mode="next"
      />
    </div>
  )
}

export default Paginator
