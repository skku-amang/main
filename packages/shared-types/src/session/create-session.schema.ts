import { BandSessionName } from "@repo/database"
import { z } from "zod"

/**
 * @description 세션 생성 Zod 스키마
 * 세션 이름과 아이콘, 리더 ID를 포함합니다.
 */
export const CreateSessionSchema = z
  .object({
    name: z.nativeEnum(BandSessionName, {
      required_error: "세션 이름은 필수 항목입니다.",
      invalid_type_error: "세션 이름은 유효한 값이어야 합니다."
    }),
    icon: z
      .string({ invalid_type_error: "아이콘은 문자열이어야 합니다." })
      .url({
        message: "아이콘은 유효한 URL이어야 합니다."
      })
      .optional(),

    leaderId: z
      .number({ invalid_type_error: "리더 ID는 숫자여야 합니다." })
      .int("리더 ID는 정수여야 합니다.")
      .optional()
  })
  .strict()

/**
 * @description 세션 생성 타입 (프론트엔드용)
 */
export type CreateSession = z.infer<typeof CreateSessionSchema>
