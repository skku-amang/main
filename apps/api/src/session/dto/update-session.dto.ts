import { createZodDto } from "nestjs-zod"
import { UpdateSessionSchema } from "@repo/shared-types"

export class UpdateSessionDto extends createZodDto(UpdateSessionSchema) {}
