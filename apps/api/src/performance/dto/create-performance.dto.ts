import { CreatePerformanceApiSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreatePerformanceDto extends createZodDto(
  CreatePerformanceApiSchema
) {}
