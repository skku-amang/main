import { createZodDto } from "nestjs-zod"
import { CreateGenerationSchema } from "@repo/shared-types"

export class CreateGenerationDto extends createZodDto(CreateGenerationSchema) {}
