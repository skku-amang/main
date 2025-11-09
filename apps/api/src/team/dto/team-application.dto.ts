import { TeamApplicationSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class TeamApplicationDto extends createZodDto(TeamApplicationSchema) {}
