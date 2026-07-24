"use client"

import { useAuth } from "@/lib/providers/auth-provider"

/**
 * 현재 로그인한 유저의 상세 정보를 반환합니다.
 * GET /auth/me 기반 (ADR-0002) — generation, sessions, bio 포함.
 */
export const useCurrentUser = () => {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    user,
    isLoading,
    isAuthenticated
  }
}
