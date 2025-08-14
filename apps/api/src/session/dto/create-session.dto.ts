import { createZodDto } from "nestjs-zod"
import { CreateSessionSchema } from "@repo/shared-types"

export class CreateSessionDto extends createZodDto(CreateSessionSchema) {}
