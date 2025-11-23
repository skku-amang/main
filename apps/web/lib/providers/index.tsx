"use client"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiClientProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </ApiClientProvider>
  )
}
