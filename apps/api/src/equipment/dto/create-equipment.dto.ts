import { createZodDto } from "nestjs-zod"
import { CreateEquipmentApiSchema } from "@repo/shared-types"

export class CreateEquipmentDto extends createZodDto(
  CreateEquipmentApiSchema
) {}
