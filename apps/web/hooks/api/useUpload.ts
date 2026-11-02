import { createMutationHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useGetPresignedUrl = createMutationHook(
  ApiClient.prototype.getPresignedUrl
)

export const useGetRecordingPresignedUrl = createMutationHook(
  ApiClient.prototype.getRecordingPresignedUrl
)
