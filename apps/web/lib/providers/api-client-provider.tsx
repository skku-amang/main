"use client"

import { signOut, useSession } from "next-auth/react"
import { createContext, ReactNode, useContext, useEffect } from "react"

import ROUTES from "@/constants/routes"
import { apiClient } from "@/lib/apiClient"
import { TokenManager } from "@/lib/auth/tokenManager"
import ApiClient from "@repo/api-client"

const ApiClientContext = createContext<ApiClient | null>(null)

/**
 * 클라이언트 컴포넌트에서 사용
 * cookie 기반 인증으로 동작 (ADR-0002).
 * AT/RT는 httpOnly cookie로 운반되며 모든 요청에 credentials: 'include'로 자동 첨부.
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

  // Legacy: next-auth session의 accessToken을 ApiClient에 주입 (백엔드 헤더 호환).
  // Phase 2.6에서 next-auth 제거 시 함께 제거.
  useEffect(() => {
    apiClient.setAccessToken(session?.accessToken ?? null)
  }, [session?.accessToken])

  // 토큰 만료 시 TokenManager (Web Locks + single-flight)로 refresh.
  // 성공 시 cookie 자동 갱신 → ApiClient가 원래 요청 재시도.
  // 실패 시 signOut → /login redirect.
  useEffect(() => {
    apiClient.setOnTokenExpired(async () => {
      try {
        await TokenManager.getInstance().refresh()
        return "cookie-refreshed"
      } catch (error) {
        console.error("[ApiClientProvider] refresh 실패, signOut 처리", error)
        signOut({
          redirectTo: `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`
        })
        return null
      }
    })
  }, [])

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}
