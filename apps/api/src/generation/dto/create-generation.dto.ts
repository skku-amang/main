import { CreateGenerationSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class CreateGenerationDto extends createZodDto(CreateGenerationSchema) {}
