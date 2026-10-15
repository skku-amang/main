import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import { useApiClient } from "@/lib/providers/api-client-provider"
import ApiClient from "@repo/api-client"
import { useInfiniteQuery } from "@tanstack/react-query"

/** 목록·미읽음 수 모두 이 prefix 아래 — 읽음 처리 뒤 한 번에 invalidate */
export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const
export const UNREAD_NOTIFICATION_COUNT_QUERY_KEY = [
  ...NOTIFICATIONS_QUERY_KEY,
  "unread-count"
] as const

export const useUnreadNotificationCount = createQueryHook(
  ApiClient.prototype.getUnreadNotificationCount,
  () => UNREAD_NOTIFICATION_COUNT_QUERY_KEY,
  (data) => data.count
)

/** 알림 목록. cursor 기반 — fetchNextPage로 다음 limit건 */
export const useNotifications = (
  limit: number,
  options?: { enabled?: boolean }
) => {
  const apiClient = useApiClient()

  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, "list", limit],
    queryFn: async ({ pageParam }) =>
      await apiClient.getNotifications({ limit, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options?.enabled
  })
}

export const useMarkNotificationRead = createMutationHook(
  ApiClient.prototype.markNotificationRead
)

export const useMarkAllNotificationsRead = createMutationHook(
  ApiClient.prototype.markAllNotificationsRead
)
