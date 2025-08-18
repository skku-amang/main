import { createZodDto } from "nestjs-zod"
import { LoginUserSchema } from "@repo/shared-types"

export class LoginUserDto extends createZodDto(LoginUserSchema) {}
