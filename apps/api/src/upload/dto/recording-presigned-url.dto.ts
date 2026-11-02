import { createZodDto } from "nestjs-zod"
import { RecordingPresignedUrlRequestSchema } from "@repo/shared-types"

export class RecordingPresignedUrlRequestDto extends createZodDto(
  RecordingPresignedUrlRequestSchema
) {}
