import { z } from "zod"
import {
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_RECORDING_SIZE
} from "../constants/file-validation"
import { safeString } from "../constants/sanitization"

export const PresignedUrlRequestSchema = z.object({
  filename: safeString({ max: 255, message: "파일명은 필수입니다." }),
  contentType: z.enum(ACCEPTED_IMAGE_TYPES as [string, ...string[]])
})

export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>

export const RecordingPresignedUrlRequestSchema = z.object({
  filename: safeString({ max: 255, message: "파일명은 필수입니다." }),
  contentType: z.enum(ACCEPTED_AUDIO_TYPES as [string, ...string[]]),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_RECORDING_SIZE, "녹음본은 50MB 이하여야 합니다.")
})

export type RecordingPresignedUrlRequest = z.infer<
  typeof RecordingPresignedUrlRequestSchema
>

export interface PresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
}
