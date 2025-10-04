"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationCustomedProps {
  /** 전체 페이지 수 */
  totalPages: number
  /** 현재 페이지 */
  currentPage: number
  /** 한 번에 보여줄 페이지 범위 (기본: 10) */
  groupSize?: number
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void
  /** 추가 className */
  className?: string
}

export default function PaginationCustomed({
  totalPages,
  currentPage,
  groupSize = 10,
  onPageChange,
  className
}: PaginationCustomedProps) {
  // 현재 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / groupSize)
  const startPage = currentGroup * groupSize + 1
  const endPage = Math.min(startPage + groupSize - 1, totalPages)

  // 페이지 배열 생성
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )

  // 이전/다음 그룹 존재 여부
  const hasPrevGroup = startPage > 1
  const hasNextGroup = endPage < totalPages

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 select-none *:text-neutral-800",
        className
      )}
    >
      {/* 이전 10 */}
      {hasPrevGroup && (
        <button
          onClick={() => onPageChange(startPage - 1)}
          className="flex items-center gap-1 mr-4 text-neutral-800 text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          Prev {groupSize}
        </button>
      )}

      {/* 첫 페이지 */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-2 text-sm transition-colors"
          >
            1
          </button>
          <span className="text-neutral-800">…</span>
        </>
      )}

      {/* 현재 그룹 페이지들 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-2 text-sm transition-colors text-neutral-800 font-normal",
            page === currentPage
              ? "font-semibold text-black"
              : "hover:text-primary"
          )}
        >
          {page}
        </button>
      ))}

      {/* 마지막 페이지 */}
      {endPage < totalPages && (
        <>
          <span className="text-gray-400">…</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-2 text-sm text-neutral-800 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 10 */}
      {hasNextGroup && (
        <button
          onClick={() => onPageChange(endPage + 1)}
          className="flex items-center ml-4 gap-1 text-sm transition-colors"
        >
          Next {groupSize}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
