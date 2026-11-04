import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const myFeedbackKey = (performanceId: number) =>
  ["feedback", "mine", performanceId] as const

export const useMyFeedback = createQueryHook(
  ApiClient.prototype.getMyFeedback,
  (performanceId: number) => myFeedbackKey(performanceId)
)

export const useUpsertFeedback = createMutationHook(
  ApiClient.prototype.upsertFeedback
)
