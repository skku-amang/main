import z from "zod"

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/

const name = z
  .string({ required_error: "필수 항목" })
  .min(2, { message: "최소 2자" })
  .max(10, { message: "최대 10자" })
const nickname = z
  .string({ required_error: "필수 항목" })
  .min(2, { message: "최소 2자" })
  .max(10, { message: "최대 10자" })
const email = z
  .string()
  .email({ message: "올바른 이메일 형식을 입력해주세요 " })
const password = z
  .string({ required_error: "필수 항목" })
  .min(8, { message: "8자리 이상 입력해 주세요." })
  .max(20, { message: "20자리 이하 입력해 주세요." })
  .regex(passwordRegex, {
    message: "영문, 숫자를 모두 조합해 주세요."
  })

export const signInSchema = z.object({
  email,
  password
})

export const signUpSchema = z.object({
  name,
  nickname,
  email,
  sessions: z
    .array(z.string())
    .min(1, {
      message: "최소 1개의 세션을 선택해주세요."
    })
    .refine((value) => value.some((item) => item)),
  password,
  confirmPassword: password
})
