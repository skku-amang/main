import { createZodDto } from "nestjs-zod"
import { GetPerformancesQuerySchema } from "@repo/shared-types"

export class GetPerformancesQueryDto extends createZodDto(
  GetPerformancesQuerySchema
) {}
