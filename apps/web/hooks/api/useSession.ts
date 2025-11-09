import ApiClient from "@repo/api-client"

import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"

export const useCreateSession = createMutationHook(
  ApiClient.prototype.createSession
)

export const useSessions = createQueryHook(
  ApiClient.prototype.getSessions,
  () => ["sessions"]
)

export const useSession = createQueryHook(
  ApiClient.prototype.getSessionById,
  (sessionId: number) => ["session", sessionId]
)

export const useUpdateSession = createMutationHook(
  ApiClient.prototype.updateSession
)

export const useDeleteSession = createMutationHook(
  ApiClient.prototype.deleteSession
)
