import { z } from "zod"
import { CreateUserSchema } from "./create-user.schema"
import { safeOptionalString } from "../constants/sanitization"

export const UpdateUserSchema = CreateUserSchema.extend({
  bio: safeOptionalString({ max: 100 })
}).partial()
export type UpdateUser = z.infer<typeof UpdateUserSchema>
