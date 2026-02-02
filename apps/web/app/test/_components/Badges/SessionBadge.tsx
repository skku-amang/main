import { cn } from "@/lib/utils"

interface SessionBadgeLgProps {
  className?: string
  label: string
}

export default function SessionBadgeLg({
  className,
  label
}: SessionBadgeLgProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "h-9 px-3 py-1.5 rounded-[17px]",
        "text-sm font-medium leading-none",
        "bg-slate-200 text-slate-700",
        className
      )}
    >
      {label}
    </span>
  )
}
