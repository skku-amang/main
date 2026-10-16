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

const useMarkNotificationsReadBySubjectMutation = createMutationHook(
  ApiClient.prototype.markNotificationsReadBySubject
)

/** 알림함 키와 분리 — 읽음 처리 invalidate에 설정까지 다시 불러오지 않게 */
export const NOTIFICATION_PREFERENCES_QUERY_KEY = [
  "notification-preferences"
] as const

export const useNotificationPreferences = createQueryHook(
  ApiClient.prototype.getNotificationPreferences,
  () => NOTIFICATION_PREFERENCES_QUERY_KEY
)

const useUpdateNotificationPreferencesMutation = createMutationHook(
  ApiClient.prototype.updateNotificationPreferences
)

/**
 * 설정 변경. 응답이 전체 설정이라 캐시를 그걸로 바로 바꾼다.
 * 날아가던 refetch(포커스 복귀 등)가 늦게 도착해 바꾼 값을 덮지 않도록 먼저 취소한다
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient()
  return useUpdateNotificationPreferencesMutation({
    onMutate: () =>
      queryClient.cancelQueries({
        queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY
      }),
    onSuccess: (data) =>
      queryClient.setQueryData(NOTIFICATION_PREFERENCES_QUERY_KEY, data)
  })
}

/** 대상(팀/공연) 페이지 도달 시 그 대상 알림 읽음 처리. 0건이면 invalidate 생략 */
export const useMarkNotificationsReadBySubject = () => {
  const invalidate = useInvalidateNotifications()
  return useMarkNotificationsReadBySubjectMutation({
    onSuccess: (result) => {
      if (result.count > 0) invalidate()
    }
  })
}
