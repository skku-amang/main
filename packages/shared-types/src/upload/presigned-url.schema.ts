import { z } from "zod"
import { ACCEPTED_IMAGE_TYPES } from "../constants/file-validation"
import { safeString } from "../constants/sanitization"

export const PresignedUrlRequestSchema = z.object({
  filename: safeString({ max: 255, message: "파일명은 필수입니다." }),
  contentType: z.enum(ACCEPTED_IMAGE_TYPES as [string, ...string[]])
})

export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>

export interface PresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
}
