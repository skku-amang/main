import z from "zod"
import { passwordField } from "./create-user.schema"

export const UpdatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "현재 비밀번호를 입력해주세요." }),
  newPassword: passwordField
})

export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>
