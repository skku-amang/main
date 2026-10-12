import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const ME_QUERY_KEY = ["me"] as const

export const useMe = createQueryHook(
  ApiClient.prototype.getMe,
  () => ME_QUERY_KEY,
  (data) => data.user
)

// ["sessions"]는 밴드 세션(악기) 쿼리가 쓰므로 구분한다
export const AUTH_SESSIONS_QUERY_KEY = ["authSessions"] as const

export const useAuthSessions = createQueryHook(
  ApiClient.prototype.getAuthSessions,
  () => AUTH_SESSIONS_QUERY_KEY,
  (data) => data.sessions
)

export const useLogoutAuthSession = createMutationHook(
  ApiClient.prototype.logoutAuthSession
)

export const useLogoutOtherAuthSessions = createMutationHook(
  ApiClient.prototype.logoutOtherAuthSessions
)
