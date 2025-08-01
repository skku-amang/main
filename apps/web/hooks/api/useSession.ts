import { DEFAULT_REACT_QUERY_STALE_TIME } from "@/constants/api"
import { useApiClient } from "@/lib/providers/api-client-provider"
import { CreateSession, Session, UpdateSession } from "@repo/shared-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreateSession() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionData: CreateSession) =>
      apiClient.createSession(sessionData),
    onSuccess: (newSession: Session) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      queryClient.setQueryData(["session", newSession.id], newSession)
    }
  })
}

export function useSessions(enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiClient.getSessions(),
    enabled,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useSession(sessionId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => apiClient.getSessionById(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUpdateSession(sessionId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updateData: UpdateSession) =>
      apiClient.updateSession(sessionId, updateData),
    onSuccess: (updatedSession: Session) => {
      queryClient.setQueryData(["session", sessionId], updatedSession)
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    }
  })
}

export function useDeleteSession() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: number) => apiClient.deleteSession(sessionId),
    onSuccess: (_, deletedSessionId) => {
      queryClient.removeQueries({
        queryKey: ["session", deletedSessionId]
      })
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    }
  })
}
