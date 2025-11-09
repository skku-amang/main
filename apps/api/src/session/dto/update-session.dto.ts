import { UpdateSessionSchema } from "@repo/shared-types"
import { createZodDto } from "nestjs-zod"

export class UpdateSessionDto extends createZodDto(UpdateSessionSchema) {}
