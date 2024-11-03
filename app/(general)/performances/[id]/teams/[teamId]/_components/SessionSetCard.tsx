import React from "react"

import { cn } from "@/lib/utils"

interface SessionSetCardProps {
  header: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const SessionSetCard = ({
  header,
  children,
  className
}: SessionSetCardProps) => {
  return (
    <div
      className={cn(
        className,
        "rounded-xl border-s-8 border-s-blue-900 bg-white px-16 py-6"
      )}
    >
      <h5 className="mb-4 select-none text-xl font-semibold">{header}</h5>
      {children}
    </div>
  )
}

export default SessionSetCard
