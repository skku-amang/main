"use client"

import { createContext, ReactNode, useContext } from "react"

import { apiClient } from "@/lib/apiClient"
import ApiClient from "@repo/api-client"

const ApiClientContext = createContext<ApiClient | null>(null)

/**
 * 클라이언트 컴포넌트에서 사용
 * cookie 기반 인증으로 동작 (ADR-0002).
 * AT/RT는 httpOnly cookie로 운반되며 모든 요청에 credentials: 'include'로 자동 첨부.
 * 토큰 만료 refresh 핸들러는 AuthProvider가 등록.
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
