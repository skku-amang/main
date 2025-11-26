"use client"

import { useSession } from "next-auth/react"
import { createContext, ReactNode, useContext, useEffect } from "react"

import { apiClient } from "@/lib/apiClient"
import ApiClient from "@repo/api-client"

const ApiClientContext = createContext<ApiClient | null>(null)

/**
 * 클라이언트 컴포넌트에서 사용
 * 세션의 accessToken이 자동으로 주입된 ApiClient를 반환합니다.
 */
export const useApiClient = () => {
  const context = useContext(ApiClientContext)
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider")
  }
  return context
}

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession()

  // 세션의 accessToken이 변경될 때마다 토큰만 업데이트
  useEffect(() => {
    apiClient.setAccessToken(session?.accessToken ?? null)
  }, [session?.accessToken])

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}
