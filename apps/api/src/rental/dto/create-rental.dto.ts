import { createZodDto } from "nestjs-zod"
import { CreateRentalSchema } from "@repo/shared-types"

export class CreateRentalDto extends createZodDto(CreateRentalSchema) {}
