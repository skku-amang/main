import z from "zod"

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/

export const nameSchema = z
  .string({ required_error: "필수 항목" })
  .min(2, { message: "최소 2자" })
  .max(10, { message: "최대 10자" })
export const nicknameSchema = z
  .string({ required_error: "필수 항목" })
  .min(2, { message: "최소 2자" })
  .max(10, { message: "최대 10자" })
export const emailSchema = z
  .string()
  .email({ message: "올바른 이메일 형식을 입력해주세요 " })
export const passwordSchema = z
  .string({ required_error: "필수 항목" })
  .min(8, { message: "8자리 이상 입력해 주세요." })
  .max(20, { message: "20자리 이하 입력해 주세요." })
  .regex(passwordRegex, {
    message: "영문, 숫자를 모두 조합해 주세요."
  })
