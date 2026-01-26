import { createZodDto } from "nestjs-zod"
import { UpdateRentalSchema } from "@repo/shared-types"

export class UpdateRentalDto extends createZodDto(UpdateRentalSchema) {}
