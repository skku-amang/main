import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CardProps {
  className?: string
  children?: ReactNode
}

const ACCENT_PX = 5

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "w-full bg-white overflow-hidden box-border rounded-[10px]",
        `shadow-[inset_${ACCENT_PX}px_0_0_0_hsl(var(--primary))]`,
        className
      )}
    >
      <div className={cn("min-w-0 p-[10px] pl-[calc(10px+0.75rem+5px)]")}>
        {children}
      </div>
    </div>
  )
}
