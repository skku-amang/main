import { MarkNotificationsReadBySubjectSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class MarkNotificationsReadBySubjectDto extends createZodDto(
  MarkNotificationsReadBySubjectSchema
) {}
