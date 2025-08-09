import { createZodDto } from "nestjs-zod"
import { CreateUserSchema } from "@repo/shared-types"

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
