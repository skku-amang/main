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
        `rounded-xl border-s-8 border-s-blue-900 bg-white px-[10%] py-[5%] md:px-[68px] md:py-[56px]`
      )}
    >
      <h5 className="select-none text-2xl font-semibold leading-normal text-slate-700">
        {header}
      </h5>
      {children}
    </div>
  )
}

export default SessionSetCard
