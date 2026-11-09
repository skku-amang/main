import { createZodDto } from "nestjs-zod"
import { UpsertFeedbackSchema } from "@repo/shared-types"

export class UpsertFeedbackDto extends createZodDto(UpsertFeedbackSchema) {}
