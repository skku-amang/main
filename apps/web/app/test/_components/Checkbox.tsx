import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox as UiCheckbox } from "@/components/ui/checkbox"

type CheckboxSize = "xs" | "sm" | "md" | "lg"

interface CheckboxProps {
  className?: string
  size?: CheckboxSize
  label: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  id?: string
}

const SIZE_STYLES: Record<
  CheckboxSize,
  {
    box: string
    label: string
    gap: string
    indicator: string
  }
> = {
  xs: {
    box: "h-4 w-4",
    label: "text-sm",
    gap: "gap-2",
    indicator:
      "[&_[data-state=checked]>svg]:h-[13px] [&_[data-state=checked]>svg]:w-[13px] [&_[data-state=checked]>svg]:stroke-[2]"
  },
  sm: {
    box: "h-5 w-5",
    label: "text-base",
    gap: "gap-3",
    indicator:
      "[&_[data-state=checked]>svg]:h-[15px] [&_[data-state=checked]>svg]:w-[15px] [&_[data-state=checked]>svg]:stroke-[2.1]"
  },
  md: {
    box: "h-6 w-6",
    label: "text-lg",
    gap: "gap-3",
    indicator:
      "[&_[data-state=checked]>svg]:h-[17px] [&_[data-state=checked]>svg]:w-[17px] [&_[data-state=checked]>svg]:stroke-[2.2]"
  },
  lg: {
    box: "h-7 w-7",
    label: "text-xl",
    gap: "gap-4",
    indicator:
      "[&_[data-state=checked]>svg]:h-[19px] [&_[data-state=checked]>svg]:w-[19px] [&_[data-state=checked]>svg]:stroke-[2.3]"
  }
}

export default function Checkbox({
  className,
  size = "md",
  label,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  id
}: CheckboxProps) {
  const s = SIZE_STYLES[size]
  const reactId = React.useId()
  const inputId = id ?? reactId

  return (
    <div className={cn("w-full flex items-center", s.gap, className)}>
      <UiCheckbox
        id={inputId}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className={cn(
          s.box,
          s.indicator,
          "transition-colors",
          // unchecked
          "border-2 border-neutral-400 bg-white",
          // checked
          "data-[state=checked]:bg-third",
          "data-[state=checked]:border-transparent",
          "data-[state=checked]:text-white"
        )}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "select-none text-neutral-700",
          s.label,
          disabled && "opacity-50"
        )}
      >
        {label}
      </label>
    </div>
  )
}
