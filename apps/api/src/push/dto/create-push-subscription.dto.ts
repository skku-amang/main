import { CreatePushSubscriptionSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreatePushSubscriptionDto extends createZodDto(
  CreatePushSubscriptionSchema
) {}
