import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import { useApiClient } from "@/lib/providers/api-client-provider"
import ApiClient from "@repo/api-client"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

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
  options?: { enabled?: boolean; staleTime?: number }
) => {
  const apiClient = useApiClient()

  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, "list", limit],
    queryFn: async ({ pageParam }) =>
      await apiClient.getNotifications({ limit, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options?.enabled,
    staleTime: options?.staleTime
  })
}

const useMarkNotificationReadMutation = createMutationHook(
  ApiClient.prototype.markNotificationRead
)
const useMarkAllNotificationsReadMutation = createMutationHook(
  ApiClient.prototype.markAllNotificationsRead
)

const useInvalidateNotifications = () => {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
}

/**
 * 읽음 처리. invalidate를 훅 레벨 onSuccess에 두어, 클릭 직후 페이지 이동으로
 * 호출한 컴포넌트가 언마운트돼도 뱃지·목록이 갱신된다 (mutate()의 콜백은 언마운트 시 버려짐)
 */
export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMarkNotificationReadMutation({ onSuccess: invalidate })
}

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMarkAllNotificationsReadMutation({ onSuccess: invalidate })
}
