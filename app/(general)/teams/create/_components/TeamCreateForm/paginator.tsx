import { GoDot, GoDotFill } from "react-icons/go"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

import { Button } from "@/components/ui/button"

interface PaginatorProps {
  onPrevious?: () => void
  onNext?: () => void
  previousButtonLabel?: string
  nextButtonLabel?: string
  isFirstPage?: boolean
  isLastPage?: boolean
  totalPage: number
  currentPage: number
}

const Paginator = ({
  onPrevious,
  onNext,
  previousButtonLabel,
  nextButtonLabel,
  isFirstPage,
  isLastPage,
  totalPage,
  currentPage
}: PaginatorProps) => {
  return (
    <div className="mt-24 flex items-center justify-around">
      <Button
        className="h-12 rounded-none"
        variant="outline"
        disabled={isFirstPage}
        onClick={onPrevious}
        type="button"
      >
        <IoIosArrowBack className="me-3" />
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
        disabled={isLastPage}
        onClick={onNext}
        type="button"
      >
        {nextButtonLabel ?? "Next"}
        <IoIosArrowForward className="ms-3" />
      </Button>
    </div>
  )
}

export default Paginator
