import { createZodDto } from "nestjs-zod"
import { UpdateProfileSchema } from "@repo/shared-types"

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
