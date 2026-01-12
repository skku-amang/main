"use client"

import { SessionProvider, signOut, useSession } from "next-auth/react"
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

  return children
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>
        <ApiClientProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ApiClientProvider>
      </SessionGuard>
    </SessionProvider>
  )
}
