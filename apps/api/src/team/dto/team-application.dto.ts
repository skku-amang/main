import { createZodDto } from "nestjs-zod"
import { TeamApplicationSchema } from "@repo/shared-types"

export class TeamApplicationDto extends createZodDto(TeamApplicationSchema) {}
