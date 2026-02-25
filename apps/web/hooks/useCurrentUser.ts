"use client"

import { useSession } from "next-auth/react"

import { useUsers } from "@/hooks/api/useUser"

/**
 * 현재 로그인한 유저의 상세 정보를 반환합니다.
 * 세션의 기본 정보 + useUsers()에서 가져온 확장 정보 (generation, sessions, bio)
 */
export const useCurrentUser = () => {
  const { data: session, status: sessionStatus } = useSession()
  const { data: users, status: usersStatus } = useUsers()

  const userId = session?.user?.id ? Number(session.user.id) : null

  const userDetail = userId
    ? (users?.find((u) => u.id === userId) ?? null)
    : null

  const isLoading = sessionStatus === "loading" || usersStatus === "pending"

  return {
    session,
    user: userDetail,
    isLoading,
    isAuthenticated: sessionStatus === "authenticated"
  }
}
