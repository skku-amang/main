import ApiClient from "@repo/api-client"

import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"

export const useCreateGeneration = createMutationHook(
  ApiClient.prototype.createGeneration
)

export const useGenerations = createQueryHook(
  ApiClient.prototype.getGenerations,
  () => ["generations"]
)

export const useGeneration = createQueryHook(
  ApiClient.prototype.getGenerationById,
  (generationId: number) => ["generation", generationId]
)

export const useUpdateGeneration = createMutationHook(
  ApiClient.prototype.updateGeneration
)

export const useDeleteGeneration = createMutationHook(
  ApiClient.prototype.deleteGeneration
)
