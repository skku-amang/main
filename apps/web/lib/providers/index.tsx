"use client"
import { SessionProvider } from "next-auth/react"

import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApiClientProvider>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </ApiClientProvider>
    </SessionProvider>
  )
}
