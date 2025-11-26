import { mapGeneration, mapGenerations } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreateGeneration = createMutationHook(
  ApiClient.prototype.createGeneration,
  mapGeneration
)

export const useGenerations = createQueryHook(
  ApiClient.prototype.getGenerations,
  () => ["generations"],
  mapGenerations
)

export const useGeneration = createQueryHook(
  ApiClient.prototype.getGenerationById,
  (generationId: number) => ["generation", generationId],
  mapGeneration
)

export const useUpdateGeneration = createMutationHook(
  ApiClient.prototype.updateGeneration,
  mapGeneration
)

export const useDeleteGeneration = createMutationHook(
  ApiClient.prototype.deleteGeneration,
  mapGeneration
)
