import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastSize = "xs" | "sm" | "md" | "lg"
type ToastTone = "positive" | "negative"

interface ToastProps {
  className?: string
  size?: ToastSize

  tone?: ToastTone
  title: string
  description?: string

  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void

  closeLabel?: string
}

const SIZE_STYLES: Record<
  ToastSize,
  {
    container: string
    title: string
    description: string
    closeBtn: string
    closeIcon: string
    minSize: string
  }
> = {
  xs: {
    container: "rounded-lg px-4 py-3",
    title: "text-sm",
    description: "text-xs",
    closeBtn: "top-2 right-2 h-7 w-7",
    closeIcon: "h-4 w-4",
    minSize: "min-h-[64px] w-[340px]"
  },
  sm: {
    container: "rounded-xl px-5 py-4",
    title: "text-sm",
    description: "text-sm",
    closeBtn: "top-2.5 right-2.5 h-8 w-8",
    closeIcon: "h-4 w-4",
    minSize: "min-h-[72px] w-[380px]"
  },
  md: {
    container: "rounded-xl px-6 py-5",
    title: "text-base",
    description: "text-sm",
    closeBtn: "top-3 right-3 h-9 w-9",
    closeIcon: "h-5 w-5",
    minSize: "min-h-[84px] w-[420px]"
  },
  lg: {
    container: "rounded-2xl px-7 py-6",
    title: "text-lg",
    description: "text-base",
    closeBtn: "top-3.5 right-3.5 h-10 w-10",
    closeIcon: "h-5 w-5",
    minSize: "min-h-[96px] w-[520px]"
  }
}

const TONE_STYLES: Record<
  ToastTone,
  {
    container: string
    title: string
    description: string
    close: string
  }
> = {
  positive: {
    container: "bg-white border-slate-200",
    title: "text-slate-900",
    description: "text-slate-800",
    close: "text-slate-400 hover:text-slate-600"
  },
  negative: {
    container: "bg-destructive/10 border-destructive/20",
    title: "text-destructive",
    description: "text-destructive",
    close: "text-destructive/70 hover:text-destructive"
  }
}

function useControllableOpen({
  open,
  defaultOpen,
  onOpenChange
}: {
  open?: boolean
  defaultOpen: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return [currentOpen, setOpen] as const
}

export default function Toast({
  className,
  size = "md",
  tone = "positive",
  title,
  description,
  defaultOpen = true,
  open,
  onOpenChange,
  closeLabel = "Close"
}: ToastProps) {
  const s = SIZE_STYLES[size]
  const t = TONE_STYLES[tone]
  const [isOpen, setIsOpen] = useControllableOpen({
    open,
    defaultOpen,
    onOpenChange
  })

  if (!isOpen) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative min-w-0 border shadow-[0_12px_30px_rgba(15,23,42,0.10)]",
        s.minSize,
        s.container,
        t.container,
        className
      )}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={() => setIsOpen(false)}
        className={cn(
          "absolute inline-flex items-center justify-center rounded-md transition-colors",
          s.closeBtn,
          t.close
        )}
      >
        <X className={cn(s.closeIcon)} />
      </button>

      <div className="min-w-0 space-y-1 pr-10">
        <div className={cn("min-w-0 truncate font-semibold", s.title, t.title)}>
          {title}
        </div>
        {description ? (
          <div
            className={cn(
              "min-w-0 truncate font-normal",
              s.description,
              t.description
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
    </div>
  )
}
