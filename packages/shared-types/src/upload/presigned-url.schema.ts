import { z } from "zod"
import { ACCEPTED_IMAGE_TYPES } from "../constants/file-validation"

export const PresignedUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ACCEPTED_IMAGE_TYPES as [string, ...string[]])
})

export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>

export interface PresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
}
