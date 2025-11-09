import { UpdateTeamSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class UpdateTeamDto extends createZodDto(UpdateTeamSchema) {}
