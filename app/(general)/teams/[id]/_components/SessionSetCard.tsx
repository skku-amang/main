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
        "rounded-lg border-s-4 border-s-primary px-16 py-6"
      )}
    >
      <h5 className="mb-4 text-xl font-bold">{header}</h5>
      {children}
    </div>
  )
}

export default SessionSetCard
