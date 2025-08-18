import { createZodDto } from "nestjs-zod"
import { UpdateGenerationSchema } from "@repo/shared-types"

export class UpdateGenerationDto extends createZodDto(UpdateGenerationSchema) {}
