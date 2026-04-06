"use client"

import "../../sentry.client.config"

import * as Sentry from "@sentry/nextjs"
import { SessionProvider, signOut, useSession } from "next-auth/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect, useRef } from "react"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

import ROUTES from "@/constants/routes"

const MAX_REFRESH_RETRIES = 3

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const isSigningOut = useRef(false)

  useEffect(() => {
    if (session?.error !== "RefreshAccessTokenError") return
    if (isSigningOut.current) return

    let cancelled = false

    const retryRefresh = async () => {
      for (let attempt = 1; attempt <= MAX_REFRESH_RETRIES; attempt++) {
        if (cancelled) return
        console.warn(
          `[SessionGuard] 토큰 갱신 재시도 ${attempt}/${MAX_REFRESH_RETRIES}`
        )
        const newSession = await update()
        if (newSession && !newSession.error) return
      }
      if (!cancelled) {
        isSigningOut.current = true
        console.error(
          "[SessionGuard] 토큰 갱신 최대 재시도 초과, 로그아웃 처리"
        )
        signOut({
          redirectTo: `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`
        })
      }
    }

    retryRefresh()

    return () => {
      cancelled = true
    }
  }, [session?.error, update])

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        username: session.user.name ?? undefined,
        email: session.user.email ?? undefined
      })
    } else {
      Sentry.setUser(null)
    }
  }, [session?.user])

  return children
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <SessionProvider refetchOnWindowFocus={false}>
        <SessionGuard>
          <ApiClientProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ApiClientProvider>
        </SessionGuard>
      </SessionProvider>
    </NuqsAdapter>
  )
}
