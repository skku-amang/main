import { createZodDto } from "nestjs-zod"
import { CreatePerformanceSchema } from "@repo/shared-types"

export class CreatePerformanceDto extends createZodDto(
  CreatePerformanceSchema
) {}
