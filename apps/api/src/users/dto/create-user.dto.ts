import { CreateUserSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
