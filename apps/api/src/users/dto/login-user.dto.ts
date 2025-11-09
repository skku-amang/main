import { LoginUserSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class LoginUserDto extends createZodDto(LoginUserSchema) {}
