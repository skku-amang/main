import { z } from "zod"
import {
  CreateUserSchema,
  emailField,
  passwordField
} from "./create-user.schema"

export const EMAIL_CODE_LENGTH = 6

export const emailCodeField = z
  .string()
  .regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), {
    message: `인증번호 ${EMAIL_CODE_LENGTH}자리를 입력해주세요.`
  })

export const SignupSchema = CreateUserSchema.extend({
  emailCode: emailCodeField
})
export type Signup = z.infer<typeof SignupSchema>

export const EmailCodeRequestSchema = z.object({
  email: emailField
})
export type EmailCodeRequest = z.infer<typeof EmailCodeRequestSchema>

export const EmailCodeConfirmSchema = z.object({
  code: emailCodeField
})
export type EmailCodeConfirm = z.infer<typeof EmailCodeConfirmSchema>

export const PasswordResetRequestSchema = EmailCodeRequestSchema
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>

export const PasswordResetConfirmSchema = z.object({
  email: emailField,
  code: emailCodeField,
  newPassword: passwordField
})
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>

export const PasswordResetTokenSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordField
})
export type PasswordResetToken = z.infer<typeof PasswordResetTokenSchema>

export const PasswordResetLinkRequestSchema = z.object({
  userId: z.number().int()
})
export type PasswordResetLinkRequest = z.infer<
  typeof PasswordResetLinkRequestSchema
>

export type PasswordResetLinkResponse = { token: string; expiresAt: string }
