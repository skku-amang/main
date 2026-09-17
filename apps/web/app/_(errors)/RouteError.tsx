"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function RouteError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-lg font-medium">문제가 발생했습니다</h2>
      <Button onClick={() => reset()}>다시 시도</Button>
    </div>
  )
}
