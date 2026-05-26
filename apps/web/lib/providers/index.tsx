"use client"

import "../../sentry.client.config"

import * as Sentry from "@sentry/nextjs"
import { SessionProvider, useSession } from "next-auth/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect } from "react"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

// ADR-0002: 이전엔 session.error === "RefreshAccessTokenError" 감지해서 signOut 했으나,
// JWT 콜백 auto-refresh 제거 후 그 error는 더 이상 세팅되지 않음.
// refresh 실패 시 signOut은 ApiClientProvider가 직접 처리.
function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

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
