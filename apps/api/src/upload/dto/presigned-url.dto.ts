import { createZodDto } from "nestjs-zod"
import { PresignedUrlRequestSchema } from "@repo/shared-types"

export class PresignedUrlRequestDto extends createZodDto(
  PresignedUrlRequestSchema
) {}
