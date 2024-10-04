import { ArrowLeft, ArrowRight } from "lucide-react"
import { GoDot, GoDotFill } from "react-icons/go"

import { Button } from "@/components/ui/button"

interface PaginatorProps {
  onPrevious?: () => void
  onNext?: () => void
  previousButtonLabel?: string
  nextButtonLabel?: string
  isPrevButtonDisabled?: boolean
  isNextButtonDisabled?: boolean
  totalPage: number
  currentPage: number
}

const Paginator = ({
  onPrevious,
  onNext,
  previousButtonLabel,
  nextButtonLabel,
  isPrevButtonDisabled,
  isNextButtonDisabled,
  totalPage,
  currentPage
}: PaginatorProps) => {
  isPrevButtonDisabled ?? currentPage === 1
  isNextButtonDisabled ?? totalPage === currentPage

  return (
    <div className="mt-24 flex items-center justify-around">
      <Button
        className="h-12 rounded-none"
        variant="outline"
        disabled={isPrevButtonDisabled}
        onClick={onPrevious}
        type="button"
      >
        <ArrowLeft className="me-3" />
        {previousButtonLabel ?? "Back"}
      </Button>
      <div className="flex items-center gap-x-3">
        {Array.from({ length: totalPage }).map((_, index) =>
          currentPage === index + 1 ? (
            <GoDotFill key={index} size={28} />
          ) : (
            <GoDot key={index} size={28} />
          )
        )}
      </div>
      <Button
        className="h-12 rounded-none"
        variant="outline"
        disabled={isNextButtonDisabled}
        onClick={onNext}
        type="button"
      >
        {nextButtonLabel ?? "Next"}
        <ArrowRight className="ms-3" />
      </Button>
    </div>
  )
}

export default Paginator
