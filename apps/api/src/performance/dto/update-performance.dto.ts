import { createZodDto } from "nestjs-zod"
import { UpdatePerformanceSchema } from "@repo/shared-types"

export class UpdatePerformanceDto extends createZodDto(
  UpdatePerformanceSchema
) {}
