import { UpdateNotificationPreferencesSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class UpdateNotificationPreferencesDto extends createZodDto(
  UpdateNotificationPreferencesSchema
) {}
