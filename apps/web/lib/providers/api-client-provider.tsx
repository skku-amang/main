"use client"

import ApiClient from "@repo/api-client"
import { createContext, ReactNode, useContext } from "react"

import { apiClient } from "@/lib/apiClient"

const ApiClientContext = createContext<ApiClient | null>(null)

/**
 * 클라이언트 컴포넌트에서 사용
 */
export const useApiClient = () => {
  const context = useContext(ApiClientContext)
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider")
  }
  return context
}

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}
