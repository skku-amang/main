import { mapPerformance, mapPerformances } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreatePerformance = createMutationHook(
  ApiClient.prototype.createPerformance,
  mapPerformance
)

export const usePerformances = createQueryHook(
  ApiClient.prototype.getPerformances,
  () => ["performances"],
  mapPerformances
)

export const usePerformance = createQueryHook(
  ApiClient.prototype.getPerformanceById,
  (performanceId: number) => ["performance", performanceId],
  mapPerformance
)

export const useUpdatePerformance = createMutationHook(
  ApiClient.prototype.updatePerformance,
  mapPerformance
)

export const useDeletePerformance = createMutationHook(
  ApiClient.prototype.deletePerformance,
  mapPerformance
)
