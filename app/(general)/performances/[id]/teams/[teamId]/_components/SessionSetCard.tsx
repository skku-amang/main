import React from "react"

import { TeamsPagePadding } from "@/app/(general)/performances/[id]/teams/[teamId]/_components/TeamsPagePadding"
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
        `rounded-xl border-s-8 border-s-blue-900 bg-white ${TeamsPagePadding.Padding}`
      )}
    >
      <h5 className="mb-4 select-none text-xl font-semibold">{header}</h5>
      {children}
    </div>
  )
}

export default SessionSetCard
