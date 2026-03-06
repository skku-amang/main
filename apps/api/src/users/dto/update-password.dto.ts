import { createZodDto } from "nestjs-zod"
import { UpdatePasswordSchema } from "@repo/shared-types"

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {}
