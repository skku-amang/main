"use client"

import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AddScheduleButtonProps {
  className?: string
  iconOnly?: boolean
  label?: string
  /** 화면에 고정된 CTA로 쓸 때 — 떠 있는 의견 버튼이 이 위로 비켜감 */
  floating?: boolean
  onClick: () => void
}

export default function AddScheduleButton({
  className,
  iconOnly,
  label,
  floating,
  onClick
}: AddScheduleButtonProps) {
  return (
    <Button
      data-floating-cta={floating || undefined}
      onClick={onClick}
      className={cn(
        iconOnly
          ? "h-14 w-14 rounded-full p-0 bg-primary text-gray-50"
          : label
            ? "text-white text-base font-semibold bg-third h-[45px] rounded-[10px]"
            : "text-gray-50 text-sm font-medium bg-primary w-36 h-9",
        className
      )}
    >
      {iconOnly ? (
        <PlusCircle size={24} />
      ) : (
        <div className="flex gap-2 justify-center items-center">
          <PlusCircle size={18} />
          {label ?? "Add schedule"}
        </div>
      )}
    </Button>
  )
}
