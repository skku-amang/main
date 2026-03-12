import z from "zod"
import { CreateUserSchema } from "./create-user.schema"

export const UpdateUserSchema = CreateUserSchema.extend({
  bio: z
    .string()
    .max(100, { message: "자기소개는 100자 이내로 작성해 주세요." })
    .optional()
}).partial()
export type UpdateUser = z.infer<typeof UpdateUserSchema>
