import { DeletePushSubscriptionSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class DeletePushSubscriptionDto extends createZodDto(
  DeletePushSubscriptionSchema
) {}
