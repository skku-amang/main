"use client"

import * as Sentry from "@sentry/nextjs"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext, useEffect } from "react"

import ROUTES from "@/constants/routes"
import { ME_QUERY_KEY, useMe } from "@/hooks/api/useAuth"
import { TokenManager } from "@/lib/auth/tokenManager"
import { useApiClient } from "@/lib/providers/api-client-provider"
import { DetailedUser, LoginUser } from "@repo/shared-types"

/**
 * Cookie 기반 인증 상태 (ADR-0002).
 * 토큰은 httpOnly cookie가 운반하므로 프론트는 GET /auth/me 결과만 본다.
 */
type AuthContextValue = {
  user: DetailedUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginUser) => Promise<DetailedUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useMe({
    retry: false,
    staleTime: 5 * 60 * 1000
  })

  const user = isError ? null : (data ?? null)
  const isLoading = isPending

  // 토큰 만료 시 TokenManager (Web Locks + single-flight)로 refresh.
  // 성공 시 cookie 자동 갱신 → ApiClient가 원래 요청 재시도.
  // 실패 시 인증 상태 초기화 후 /login redirect.
  useEffect(() => {
    apiClient.setOnTokenExpired(async () => {
      try {
        await TokenManager.getInstance().refresh()
        return true
      } catch (error) {
        console.error(
          "[AuthProvider] refresh 실패, 로그인 페이지로 이동",
          error
        )
        queryClient.setQueryData(ME_QUERY_KEY, null)
        window.location.href = `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`
        return false
      }
    })
  }, [apiClient, queryClient])

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: String(user.id),
        username: user.name ?? undefined,
        email: user.email ?? undefined
      })
    } else {
      Sentry.setUser(null)
    }
  }, [user])

  const login = async (credentials: LoginUser) => {
    const result = await apiClient.login(credentials)
    queryClient.setQueryData(ME_QUERY_KEY, result.user)
    return result.user
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } finally {
      queryClient.setQueryData(ME_QUERY_KEY, null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
