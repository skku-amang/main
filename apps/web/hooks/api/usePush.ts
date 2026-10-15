import { createMutationHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreatePushSubscription = createMutationHook(
  ApiClient.prototype.createPushSubscription
)

export const useDeletePushSubscription = createMutationHook(
  ApiClient.prototype.deletePushSubscription
)
