import { createZodDto } from "nestjs-zod"
import { UpdateTeamSchema } from "@repo/shared-types"

export class UpdateTeamDto extends createZodDto(UpdateTeamSchema) {}
