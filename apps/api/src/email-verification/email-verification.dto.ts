import { createZodDto } from "nestjs-zod"
import {
  EmailCodeConfirmSchema,
  EmailCodeRequestSchema,
  SignupSchema
} from "@repo/shared-types"

export class SignupDto extends createZodDto(SignupSchema) {}
export class EmailCodeRequestDto extends createZodDto(EmailCodeRequestSchema) {}
export class EmailCodeConfirmDto extends createZodDto(EmailCodeConfirmSchema) {}
