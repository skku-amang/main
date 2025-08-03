import { DEFAULT_REACT_QUERY_STALE_TIME } from "@/constants/api"
import { useApiClient } from "@/lib/providers/api-client-provider"
import {
  CreatePerformance,
  Performance,
  UpdatePerformance
} from "@repo/shared-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreatePerformance() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (performanceData: CreatePerformance) =>
      apiClient.createPerformance(performanceData),
    onSuccess: (newPerformance: Performance) => {
      queryClient.invalidateQueries({ queryKey: ["performances"] })
      queryClient.setQueryData(
        ["performance", newPerformance.id],
        newPerformance
      )
    }
  })
}

export function usePerformances(enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["performances"],
    queryFn: () => apiClient.getPerformances(),
    enabled,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function usePerformance(performanceId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["performance", performanceId],
    queryFn: () => apiClient.getPerformanceById(performanceId),
    enabled: enabled && !!performanceId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUpdatePerformance(performanceId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updateData: UpdatePerformance) =>
      apiClient.updatePerformance(performanceId, updateData),
    onSuccess: (updatedPerformance: Performance) => {
      queryClient.setQueryData(
        ["performance", performanceId],
        updatedPerformance
      )
      queryClient.invalidateQueries({ queryKey: ["performances"] })
    }
  })
}

export function useDeletePerformance() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (performanceId: number) =>
      apiClient.deletePerformance(performanceId),
    onSuccess: (_, deletedPerformanceId) => {
      queryClient.removeQueries({
        queryKey: ["performance", deletedPerformanceId]
      })
      queryClient.invalidateQueries({ queryKey: ["performances"] })
    }
  })
}
