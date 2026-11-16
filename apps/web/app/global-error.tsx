"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px"
          }}
        >
          <h2>문제가 발생했습니다</h2>
          <button onClick={() => retry()}>다시 시도</button>
        </div>
      </body>
    </html>
  )
}
