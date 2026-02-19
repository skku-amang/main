"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ResponsivePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = [1]

  if (currentPage > 3) {
    pages.push("ellipsis")
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)
  return pages
}

const ResponsivePagination = React.forwardRef<
  HTMLElement,
  ResponsivePaginationProps
>(({ currentPage, totalPages, onPageChange, className }, ref) => {
  if (totalPages < 1) return null

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      {/* Mobile: dropdown-based */}
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">Page</span>

        <Select
          value={String(currentPage)}
          onValueChange={(value) => onPageChange(Number(value))}
        >
          <SelectTrigger className="h-9 w-auto min-w-[3.5rem] gap-1 px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">of {totalPages}</span>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: numbered links */}
      <Pagination className="hidden md:flex">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (isFirstPage) return
                onPageChange(currentPage - 1)
              }}
              className={cn(isFirstPage && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (isLastPage) return
                onPageChange(currentPage + 1)
              }}
              className={cn(isLastPage && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </nav>
  )
})
ResponsivePagination.displayName = "ResponsivePagination"

export { ResponsivePagination, type ResponsivePaginationProps }
