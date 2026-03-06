import z from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해 주세요." }),
  nickname: z.string().min(1, { message: "닉네임을 입력해 주세요." }),
  bio: z
    .string()
    .max(100, { message: "자기소개는 100자 이내로 작성해 주세요." })
    .optional(),
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
