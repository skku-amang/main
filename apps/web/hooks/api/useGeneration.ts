import { DEFAULT_REACT_QUERY_STALE_TIME } from "@/constants/api"
import { useApiClient } from "@/lib/providers/api-client-provider"
import {
  CreateGeneration,
  Generation,
  UpdateGeneration
} from "@repo/shared-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreateGeneration() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (generationData: CreateGeneration) =>
      apiClient.createGeneration(generationData),
    onSuccess: (newGeneration: Generation) => {
      queryClient.invalidateQueries({ queryKey: ["generations"] })
      queryClient.setQueryData(["generation", newGeneration.id], newGeneration)
    }
  })
}

export function useGenerations(enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["generations"],
    queryFn: () => apiClient.getGenerations(),
    enabled,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useGeneration(generationId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["generation", generationId],
    queryFn: () => apiClient.getGenerationById(generationId),
    enabled: enabled && !!generationId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUpdateGeneration(generationId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updateData: UpdateGeneration) =>
      apiClient.updateGeneration(generationId, updateData),
    onSuccess: (updatedGeneration: Generation) => {
      queryClient.setQueryData(["generation", generationId], updatedGeneration)
      queryClient.invalidateQueries({ queryKey: ["generations"] })
    }
  })
}

export function useDeleteGeneration() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (generationId: number) =>
      apiClient.deleteGeneration(generationId),
    onSuccess: (_, deletedGenerationId) => {
      queryClient.removeQueries({
        queryKey: ["generation", deletedGenerationId]
      })
      queryClient.invalidateQueries({ queryKey: ["generations"] })
    }
  })
}
