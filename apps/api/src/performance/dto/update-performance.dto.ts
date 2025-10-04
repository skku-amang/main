import { createZodDto } from "nestjs-zod"
import { UpdatePerformanceApiSchema } from "@repo/shared-types"

export class UpdatePerformanceDto extends createZodDto(
  UpdatePerformanceApiSchema
) {}
