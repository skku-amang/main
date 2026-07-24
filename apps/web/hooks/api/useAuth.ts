import { createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const ME_QUERY_KEY = ["me"] as const

export const useMe = createQueryHook(
  ApiClient.prototype.getMe,
  () => ME_QUERY_KEY,
  (data) => data.user
)
