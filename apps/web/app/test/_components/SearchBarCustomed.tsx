"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface SearchBarCustomedProps {
  /** 컨테이너 전체 className */
  className?: string
  /** input 내부 스타일 커스터마이징 */
  inputClassName?: string
  /** 아이콘 className (색상, 위치 조정 등) */
  iconClassName?: string
  /** placeholder 텍스트 (기본: "검색") */
  placeholder?: string
  /** input 값 변경 핸들러 */
  onChange?: (value: string) => void
  /** 현재 input 값 (controlled component용) */
  value?: string
  /** 아이콘 클릭 시 콜백 */
  onIconClick?: () => void
  /** 아이콘 표시 여부 */
  showIcon?: boolean
}

export default function SearchBarCustomed({
  className,
  inputClassName,
  iconClassName,
  placeholder = "검색",
  onChange,
  value,
  onIconClick,
  showIcon = true
}: SearchBarCustomedProps) {
  return (
    <div className={cn("relative w-fit", className)}>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          // ✅ 기본 디자인
          "w-80 h-10 rounded-[20px] text-neutral-400 text-base font-normal leading-normal",
          "pl-[50px] pr-[13px] py-2 border-[1px] border-gray-200 shadow-[0px_1px_2px_0px_rgba(64,63,84,0.10)]",
          "placeholder:opacity-100 focus:placeholder:opacity-0 placeholder:transition-opacity placeholder:duration-500",
          "hover:border-gray-300 hover:cursor-pointer focus-visible:ring-0 hover:shadow-none",
          inputClassName // 🔄 사용자 커스터마이징
        )}
      />
      {showIcon && (
        <Search
          onClick={onIconClick}
          size={20}
          strokeWidth={1.5}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors",
            "hover:text-gray-700 cursor-pointer",
            iconClassName
          )}
        />
      )}
    </div>
  )
}
