"use client"

import { useEffect, useState } from "react"

import { getRepresentativeRelativeTime } from "@/lib/utils"

interface RelativeTimeProps {
  date: Date | string
  className?: string
}

/** '12초 전'·'13분 전' 같은 상대 시각. 1분 전까지는 1초, 그 뒤로는 1분마다 다시 계산한다 */
const RelativeTime = ({ date, className }: RelativeTimeProps) => {
  const [, setTick] = useState(0)

  useEffect(() => {
    const elapsed = Date.now() - new Date(date).getTime()
    const timer = setTimeout(
      () => setTick((t) => t + 1),
      elapsed < 60_000 ? 1_000 : 60_000
    )
    return () => clearTimeout(timer)
  })

  return (
    <time
      dateTime={new Date(date).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {getRepresentativeRelativeTime(date)}
    </time>
  )
}

export default RelativeTime
