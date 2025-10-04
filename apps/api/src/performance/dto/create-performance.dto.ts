import { createZodDto } from "nestjs-zod"
import { CreatePerformanceApiSchema } from "@repo/shared-types"

export class CreatePerformanceDto extends createZodDto(
  CreatePerformanceApiSchema
) {}
