import { CreateTeamSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreateTeamDto extends createZodDto(CreateTeamSchema) {}
