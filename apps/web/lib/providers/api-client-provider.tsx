"use client"

import { useSession } from "next-auth/react"
import { createContext, ReactNode, useContext, useEffect } from "react"

import { apiClient } from "@/lib/apiClient"
import ApiClient, {
  setAccessToken as setSpecAccessToken,
  setOnTokenExpired as setSpecOnTokenExpired
} from "@repo/api-client"
// 사이드이펙트 import — spec-client.ts가 generated client에 response interceptor 등록.
// PoC 마이그레이션 중에는 legacy ApiClient와 spec-derived client가 공존하므로 둘 다 init.
import "@repo/api-client/spec-client"

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
  const { data: session, update } = useSession()

  // 세션의 accessToken이 변경될 때마다 토큰을 legacy/spec 양쪽에 동기화.
  useEffect(() => {
    const token = session?.accessToken ?? null
    apiClient.setAccessToken(token)
    setSpecAccessToken(token)
  }, [session?.accessToken])

  // 토큰 만료 시 세션 갱신 핸들러 설정 (legacy + spec).
  useEffect(() => {
    const handler = async () => {
      const newSession = await update()
      return newSession?.accessToken ?? null
    }
    apiClient.setOnTokenExpired(handler)
    setSpecOnTokenExpired(handler)
  }, [update])

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}
