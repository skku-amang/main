"use client"

import "../../sentry.client.config"

import * as Sentry from "@sentry/nextjs"
import { SessionProvider, signOut, useSession } from "next-auth/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect, useRef } from "react"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

import ROUTES from "@/constants/routes"

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isSigningOut = useRef(false)

  // 토큰 갱신은 ApiClientProvider의 onTokenExpired에서 담당.
  // 여기서는 갱신 최종 실패(RefreshAccessTokenError) 시 signOut만 처리.
  useEffect(() => {
    if (session?.error !== "RefreshAccessTokenError") return
    if (isSigningOut.current) return

    isSigningOut.current = true
    console.error("[SessionGuard] 토큰 갱신 실패, 로그아웃 처리")
    signOut({
      redirectTo: `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`
    })
  }, [session?.error])

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
