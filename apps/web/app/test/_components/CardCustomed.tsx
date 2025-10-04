import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CardCustomedProps {
  className?: string
  children?: ReactNode
}

export default function CardCustomed({
  className,
  children
}: CardCustomedProps) {
  return (
    <div
      className={cn(
        "w-[662px] p-[10px] h-56 bg-White rounded-[10px] shadow-[inset_6px_0px_0px_0px_rgba(30,58,138,1.00)]",
        className
      )}
    >
      {children}
    </div>
  )
}
