import { UpdatePerformanceApiSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class UpdatePerformanceDto extends createZodDto(
  UpdatePerformanceApiSchema
) {}
