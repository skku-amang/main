import * as React from "react"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export type DropdownMenuOption = {
  value: string
  label: string
  disabled?: boolean
}

export type DropdownUserOption = {
  value: string
  name: string
  tag?: string
  imageSrc: string
  imageAlt?: string
  disabled?: boolean
}

type CommonProps = {
  className?: string
  placeholder?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  ariaLabel?: string
  contentClassName?: string
  maxContentHeight?: number
  contentWidth?: "trigger" | "auto"
}

type MenuDropdownProps = CommonProps & {
  variant?: "menu"
  options: DropdownMenuOption[]
}

type UserDropdownProps = CommonProps & {
  variant: "user"
  options: DropdownUserOption[]
}

export type DropdownProps = MenuDropdownProps | UserDropdownProps

const TRIGGER_BASE =
  "relative w-full min-w-0 bg-white justify-between border border-slate-200 rounded-xl " +
  "focus:ring-0 data-[state=open]:border-third " +
  "text-slate-700 data-[placeholder]:text-slate-400"

const TRIGGER_SIZING = "h-11 px-4 text-sm"
const TRIGGER_ICON_SLOT = "pr-11"
const TRIGGER_ICON_STYLE =
  "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 " +
  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-slate-700"

const CONTENT_BASE =
  "bg-white border border-slate-100 rounded-xl shadow-[0_18px_48px_rgba(15,23,42,0.10)]"

export default function Dropdown(props: DropdownProps) {
  const {
    className,
    placeholder = "Select",
    disabled,
    value,
    defaultValue,
    onValueChange,
    name,
    required,
    ariaLabel,
    contentClassName,
    maxContentHeight = 280,
    contentWidth = "trigger"
  } = props

  const variant = props.variant ?? "menu"

  const displayText = React.useMemo(() => {
    if (!value) return undefined
    if (variant === "user") {
      return (props as UserDropdownProps).options.find((o) => o.value === value)
        ?.name
    }
    return (props as MenuDropdownProps).options.find((o) => o.value === value)
      ?.label
  }, [props, value, variant])

  return (
    <div className={cn("w-full min-w-0", className)}>
      <Select
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onValueChange={onValueChange}
        name={name}
        required={required}
      >
        <SelectTrigger
          aria-label={ariaLabel}
          className={cn(
            TRIGGER_BASE,
            TRIGGER_SIZING,
            TRIGGER_ICON_SLOT,
            TRIGGER_ICON_STYLE,
            "[&>span]:truncate"
          )}
        >
          <SelectValue placeholder={placeholder}>{displayText}</SelectValue>
        </SelectTrigger>

        <SelectContent
          position="popper"
          className={cn(
            CONTENT_BASE,
            contentWidth === "trigger" &&
              "w-[--radix-select-trigger-width] max-w-full",
            "p-0 overflow-hidden",
            contentClassName
          )}
        >
          <div
            className={cn(
              "overflow-y-auto overflow-x-hidden",
              "pr-2 py-2 pl-2",
              "scrollbar-thin",
              "scrollbar-thumb-gray-300 scrollbar-track-transparent"
            )}
            style={{ maxHeight: maxContentHeight }}
          >
            {variant === "menu" &&
              (props as MenuDropdownProps).options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative flex items-center",
                    "text-slate-700",
                    "data-[highlighted]:bg-slate-100",
                    "data-[state=checked]:bg-slate-100",
                    "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
                    "h-10 rounded-lg pl-10 pr-3"
                  )}
                >
                  <span className="truncate font-medium">{opt.label}</span>
                </SelectItem>
              ))}

            {variant === "user" &&
              (props as UserDropdownProps).options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative outline-none",
                    "data-[highlighted]:bg-slate-100",
                    "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
                    "[&_[data-state=checked]]:hidden",
                    "h-12 rounded-xl px-3"
                  )}
                >
                  <div className="w-full min-w-0 flex items-center gap-3">
                    <img
                      src={opt.imageSrc}
                      alt={opt.imageAlt ?? opt.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-700 text-sm">
                        {opt.name}
                      </div>
                      {opt.tag && (
                        <div className="truncate text-slate-500 text-xs">
                          {opt.tag}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}
