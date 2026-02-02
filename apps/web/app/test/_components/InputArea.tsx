import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"

type InputAreaSize = "xs" | "sm" | "md" | "lg"
type InputAreaState = "default" | "error"

interface InputAreaProps {
  className?: string
  inputClassName?: string
  size?: InputAreaSize

  label: string
  required?: boolean
  description?: string

  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void

  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  autoComplete?: string
  type?: React.HTMLInputTypeAttribute

  state?: InputAreaState
  errorMessage?: string
}

const SIZE_STYLES: Record<
  InputAreaSize,
  {
    label: string
    requiredStar: string
    description: string
    input: string
    errorText: string
    icon: string
    iconRight: string
  }
> = {
  xs: {
    label: "text-xs",
    requiredStar: "text-xs",
    description: "text-xs",
    input: "h-8 text-sm rounded-lg px-3",
    errorText: "text-xs",
    icon: "h-3.5 w-3.5",
    iconRight: "right-2.5"
  },
  sm: {
    label: "text-sm",
    requiredStar: "text-sm",
    description: "text-xs",
    input: "h-9 text-sm rounded-lg px-3",
    errorText: "text-xs",
    icon: "h-4 w-4",
    iconRight: "right-3"
  },
  md: {
    label: "text-sm",
    requiredStar: "text-sm",
    description: "text-sm",
    input: "h-10 text-base rounded-lg px-3",
    errorText: "text-sm",
    icon: "h-4 w-4",
    iconRight: "right-3"
  },
  lg: {
    label: "text-base",
    requiredStar: "text-base",
    description: "text-sm",
    input: "h-12 text-base rounded-xl px-4",
    errorText: "text-sm",
    icon: "h-5 w-5",
    iconRight: "right-4"
  }
}

export default function InputArea({
  className,
  inputClassName,
  size = "md",
  label,
  required,
  description,
  value,
  defaultValue,
  onChange,
  placeholder,
  name,
  id,
  disabled,
  autoComplete,
  type = "text",
  state = "default",
  errorMessage
}: InputAreaProps) {
  const s = SIZE_STYLES[size]
  const computedId = React.useId()
  const inputId = id ?? computedId
  const isError = state === "error"

  return (
    <div className={cn("w-full min-w-0 space-y-1.5", className)}>
      <div className="flex items-center gap-1">
        <label
          htmlFor={inputId}
          className={cn("font-semibold text-slate-900", s.label)}
        >
          {label}
        </label>
        {required ? (
          <span
            className={cn("font-semibold text-destructive", s.requiredStar)}
          >
            *
          </span>
        ) : null}
      </div>

      {description ? (
        <div className={cn("text-slate-500", s.description)}>{description}</div>
      ) : null}

      <div className="relative w-full min-w-0">
        <Input
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={isError}
          className={cn(
            "w-full min-w-0",
            "bg-white border border-slate-300 text-slate-700",
            "placeholder:text-slate-400 placeholder:opacity-100",
            "placeholder:transition-opacity placeholder:duration-500",
            "focus:placeholder:opacity-0 focus-visible:ring-0 focus-visible:border-third",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "transition-[box-shadow,border-color] duration-200 ease-out",
            "shadow-[0px_1px_2px_0px_rgba(15,23,42,0.06)]",
            "hover:shadow-[0px_2px_6px_0px_rgba(15,23,42,0.10)]",
            isError && "border-destructive focus-visible:border-destructive",
            isError && errorMessage && "pr-10",
            s.input,
            inputClassName
          )}
        />

        {isError ? (
          <AlertTriangle
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-destructive",
              s.icon,
              s.iconRight
            )}
          />
        ) : null}
      </div>

      {isError && errorMessage ? (
        <div className={cn("text-destructive", s.errorText)}>
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
}
