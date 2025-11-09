import { CreateSessionSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreateSessionDto extends createZodDto(CreateSessionSchema) {}
