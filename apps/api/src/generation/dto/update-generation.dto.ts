import { UpdateGenerationSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class UpdateGenerationDto extends createZodDto(UpdateGenerationSchema) {}
