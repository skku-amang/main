import { GetNotificationsQuerySchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class GetNotificationsQueryDto extends createZodDto(
  GetNotificationsQuerySchema
) {}
