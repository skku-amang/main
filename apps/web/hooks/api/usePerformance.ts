import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreatePerformance = createMutationHook(
  ApiClient.prototype.createPerformance
)

export const usePerformances = createQueryHook(
  ApiClient.prototype.getPerformances,
  () => ["performances"]
)

export const usePerformance = createQueryHook(
  ApiClient.prototype.getPerformanceById,
  (performanceId: number) => ["performance", performanceId]
)

export const useUpdatePerformance = createMutationHook(
  ApiClient.prototype.updatePerformance
)

export const useDeletePerformance = createMutationHook(
  ApiClient.prototype.deletePerformance
)
