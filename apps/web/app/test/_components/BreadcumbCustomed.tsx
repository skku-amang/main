import { cn } from "@/lib/utils"
import { ChevronRight, House } from "lucide-react"

interface BreadcrumbCustomedProps {
  /** 컨테이너 전체 className */
  className?: string
  /** 각 단계 이름 리스트 */
  indexList: string[]
  /** 현재 위치(마지막 항목) 색상이나 강조 스타일 */
  activeClassName?: string
  /** 일반 단계의 텍스트 스타일 */
  itemClassName?: string
  /** 아이콘 크기 (기본: 18) */
  iconSize?: number
  /** 첫 아이콘 표시 여부 */
  showHomeIcon?: boolean
}

export default function BreadcrumbCustomed({
  className,
  indexList,
  activeClassName,
  itemClassName,
  iconSize = 18,
  showHomeIcon = true
}: BreadcrumbCustomedProps) {
  return (
    <nav
      className={cn(
        "flex items-center gap-[2px] text-slate-400 font-medium select-none",
        className
      )}
      aria-label="breadcrumb"
    >
      {showHomeIcon && <House size={iconSize} strokeWidth={1.8} />}

      {indexList.map((label, i) => {
        const isLast = i === indexList.length - 1
        return (
          <div className="flex items-center gap-[2px]" key={`${label}-${i}`}>
            <ChevronRight size={iconSize} strokeWidth={1.8} />
            <span
              className={cn(
                "transition-colors",
                isLast
                  ? cn("text-primary font-semibold", activeClassName)
                  : cn("text-slate-400", itemClassName)
              )}
            >
              {label}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
