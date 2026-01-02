import { createZodDto } from "nestjs-zod"
import { GetRentalsQuerySchema } from "@repo/shared-types"

export class GetRentalQueryDto extends createZodDto(GetRentalsQuerySchema) {}
