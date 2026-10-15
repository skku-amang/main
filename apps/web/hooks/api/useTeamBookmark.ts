import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import { useAuth } from "@/lib/providers/auth-provider"
import ApiClient from "@repo/api-client"

const TEAM_BOOKMARKS_KEY = ["teamBookmarks"]

const useMyTeamBookmarkIds = createQueryHook(
  ApiClient.prototype.getMyTeamBookmarks,
  () => TEAM_BOOKMARKS_KEY
)
const useAddTeamBookmark = createMutationHook(
  ApiClient.prototype.addTeamBookmark
)
const useRemoveTeamBookmark = createMutationHook(
  ApiClient.prototype.removeTeamBookmark
)

/** 내가 별표한 팀 id 집합. 비로그인이면 빈 집합 */
export const useTeamBookmarks = () => {
  const { isAuthenticated } = useAuth()
  const { data } = useMyTeamBookmarkIds({ enabled: isAuthenticated })
  return useMemo(() => new Set(data ?? []), [data])
}

/** 별표 토글. 서버 응답 전에 화면부터 바꾸고, 실패하면 되돌린다 */
export const useToggleTeamBookmark = () => {
  const queryClient = useQueryClient()
  const add = useAddTeamBookmark()
  const remove = useRemoveTeamBookmark()

  return async (teamId: number, bookmarked: boolean) => {
    await queryClient.cancelQueries({ queryKey: TEAM_BOOKMARKS_KEY })
    const previous = queryClient.getQueryData<number[]>(TEAM_BOOKMARKS_KEY)
    queryClient.setQueryData<number[]>(TEAM_BOOKMARKS_KEY, (ids = []) =>
      bookmarked
        ? ids.filter((id) => id !== teamId)
        : [teamId, ...ids.filter((id) => id !== teamId)]
    )
    try {
      if (bookmarked) await remove.mutateAsync([teamId])
      else await add.mutateAsync([teamId])
    } catch {
      queryClient.setQueryData(TEAM_BOOKMARKS_KEY, previous)
    } finally {
      queryClient.invalidateQueries({ queryKey: TEAM_BOOKMARKS_KEY })
    }
  }
}
