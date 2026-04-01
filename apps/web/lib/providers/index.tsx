"use client"

import "../../sentry.client.config"

import * as Sentry from "@sentry/nextjs"
import { SessionProvider, signOut, useSession } from "next-auth/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect } from "react"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut()
    }
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
      <SessionProvider>
        <SessionGuard>
          <ApiClientProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ApiClientProvider>
        </SessionGuard>
      </SessionProvider>
    </NuqsAdapter>
  )
}
