import { mapSession, mapSessions } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreateSession = createMutationHook(
  ApiClient.prototype.createSession,
  mapSession
)

export const useSessions = createQueryHook(
  ApiClient.prototype.getSessions,
  () => ["sessions"],
  mapSessions
)

export const useSession = createQueryHook(
  ApiClient.prototype.getSessionById,
  (sessionId: number) => ["session", sessionId],
  mapSession
)

export const useUpdateSession = createMutationHook(
  ApiClient.prototype.updateSession,
  mapSession
)

export const useDeleteSession = createMutationHook(
  ApiClient.prototype.deleteSession,
  mapSession
)
