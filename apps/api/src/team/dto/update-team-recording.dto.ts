import { createZodDto } from "nestjs-zod"
import { UpdateTeamRecordingSchema } from "@repo/shared-types"

export class UpdateTeamRecordingDto extends createZodDto(
  UpdateTeamRecordingSchema
) {}
