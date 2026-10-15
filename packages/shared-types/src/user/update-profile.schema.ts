import z from "zod"
import { safeString, safeOptionalString } from "../constants/sanitization"

export const UpdateProfileSchema = z.object({
  name: safeString({ max: 50, message: "이름을 입력해 주세요." }),
  nickname: safeString({ max: 30, message: "닉네임을 입력해 주세요." }),
  bio: safeOptionalString({ max: 100 }),
  sessions: z
    .array(z.number().int({ message: "세션 ID는 정수여야 합니다." }))
    .min(1, { message: "최소 하나의 세션을 선택해야 합니다." })
    .optional(),
  image: z
    .string()
    .url({ message: "유효한 이미지 주소(URL)를 입력해 주세요." })
    .optional()
})

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
