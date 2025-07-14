"use client"

import ApiClient from "@repo/api-client"
import { createContext, ReactNode, useContext } from "react"

const ApiClientContext = createContext<ApiClient | null>(null)

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  )

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}

export const useApiClient = () => {
  const context = useContext(ApiClientContext)
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider")
  }
  return context
}
