import { createZodDto } from "nestjs-zod"
import { UpdateUserSchema } from "@repo/shared-types"

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
