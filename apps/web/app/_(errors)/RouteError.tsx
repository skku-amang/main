"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function RouteError({
  error,
  retry
}: {
  error: Error & { digest?: string }
  // reset()은 서버에서 다시 받아오지 않아 서버 쪽 오류(API 연결 실패 등)가 그대로 남는다
  retry: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-lg font-medium">문제가 발생했습니다</h2>
      <Button onClick={() => retry()}>다시 시도</Button>
    </div>
  )
}
