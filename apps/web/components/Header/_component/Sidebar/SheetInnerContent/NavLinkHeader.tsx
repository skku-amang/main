import React from "react"

import { cn } from "@/lib/utils"

interface SheetInnerContentNavLinkHeaderProps {
  children: React.ReactNode
  className?: string
}

const SheetInnerContentNavLinkHeader = ({
  children,
  className
}: SheetInnerContentNavLinkHeaderProps) => {
  return (
    <div className={cn("w-full text-gray-500 text-sm", className)}>
      {children}
    </div>
  )
}

export default SheetInnerContentNavLinkHeader
