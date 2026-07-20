"use client"

import "../../sentry.client.config"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ApiClientProvider } from "./api-client-provider"
import { AuthProvider } from "./auth-provider"
import ReactQueryProvider from "./react-query-provider"

// Sentry.setUser는 AuthProvider가 /auth/me 결과로 처리 (ADR-0002).
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ApiClientProvider>
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </ApiClientProvider>
    </NuqsAdapter>
  )
}
