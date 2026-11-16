import { createZodDto } from "nestjs-zod"
import {
  EmailCodeConfirmSchema,
  EmailCodeRequestSchema,
  PasswordResetConfirmSchema,
  PasswordResetLinkRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetTokenSchema,
  SignupSchema
} from "@repo/shared-types"

export class SignupDto extends createZodDto(SignupSchema) {}
export class EmailCodeRequestDto extends createZodDto(EmailCodeRequestSchema) {}
export class EmailCodeConfirmDto extends createZodDto(EmailCodeConfirmSchema) {}

export class PasswordResetRequestDto extends createZodDto(
  PasswordResetRequestSchema
) {}
export class PasswordResetConfirmDto extends createZodDto(
  PasswordResetConfirmSchema
) {}
export class PasswordResetTokenDto extends createZodDto(
  PasswordResetTokenSchema
) {}
export class PasswordResetLinkRequestDto extends createZodDto(
  PasswordResetLinkRequestSchema
) {}
