import { createZodDto } from "nestjs-zod"
import { UpdateEquipmentApiSchema } from "@repo/shared-types"

export class UpdateEquipmentDto extends createZodDto(
  UpdateEquipmentApiSchema
) {}
