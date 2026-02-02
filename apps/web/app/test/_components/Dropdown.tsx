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

export type DropdownSize = "xs" | "sm" | "md" | "lg"

type CommonProps = {
  className?: string
  size?: DropdownSize

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

const CONTENT_BASE =
  "bg-white border border-slate-100 rounded-xl shadow-[0_18px_48px_rgba(15,23,42,0.10)]"

const SIZE_STYLES: Record<
  DropdownSize,
  {
    trigger: string
    triggerIconSlot: string
    triggerIcon: string
    menuItem: string
    userItem: string
    avatar: string
    userName: string
    userTag: string
  }
> = {
  xs: {
    trigger: "h-9 px-3 text-xs",
    triggerIconSlot: "pr-9",
    triggerIcon:
      "[&>svg]:absolute [&>svg]:right-2.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 " +
      "[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-slate-700",
    menuItem: "h-8 rounded-md pl-8 pr-2.5",
    userItem: "h-10 rounded-lg px-2.5",
    avatar: "h-7 w-7",
    userName: "text-xs font-semibold text-slate-700",
    userTag: "text-[11px] text-slate-500"
  },
  sm: {
    trigger: "h-10 px-3.5 text-sm",
    triggerIconSlot: "pr-10",
    triggerIcon:
      "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 " +
      "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-slate-700",
    menuItem: "h-9 rounded-lg pl-9 pr-3",
    userItem: "h-11 rounded-xl px-3",
    avatar: "h-8 w-8",
    userName: "text-sm font-semibold text-slate-700",
    userTag: "text-xs text-slate-500"
  },
  md: {
    trigger: "h-11 px-4 text-sm",
    triggerIconSlot: "pr-11",
    triggerIcon:
      "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 " +
      "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-slate-700",
    menuItem: "h-10 rounded-lg pl-10 pr-3",
    userItem: "h-12 rounded-xl px-3",
    avatar: "h-9 w-9",
    userName: "text-sm font-semibold text-slate-700",
    userTag: "text-xs text-slate-500"
  },
  lg: {
    trigger: "h-12 px-5 text-base",
    triggerIconSlot: "pr-12",
    triggerIcon:
      "[&>svg]:absolute [&>svg]:right-3.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 " +
      "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-slate-700",
    menuItem: "h-11 rounded-xl pl-11 pr-4",
    userItem: "h-14 rounded-2xl px-4",
    avatar: "h-10 w-10",
    userName: "text-base font-semibold text-slate-700",
    userTag: "text-sm text-slate-500"
  }
}

export default function Dropdown(props: DropdownProps) {
  const {
    className,
    size = "md",
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

  const s = SIZE_STYLES[size]
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
            s.trigger,
            s.triggerIconSlot,
            s.triggerIcon,
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
              "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
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
                    s.menuItem
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
                    s.userItem
                  )}
                >
                  <div className="w-full min-w-0 flex items-center gap-3">
                    <img
                      src={opt.imageSrc}
                      alt={opt.imageAlt ?? opt.name}
                      className={cn(
                        "rounded-full object-cover shrink-0",
                        s.avatar
                      )}
                    />
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "truncate font-semibold text-slate-700",
                          s.userName
                        )}
                      >
                        {opt.name}
                      </div>
                      {opt.tag ? (
                        <div className={cn("truncate", s.userTag)}>
                          {opt.tag}
                        </div>
                      ) : null}
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
