import { z } from "zod"
import { createZodDto } from "nestjs-zod"

/**
 * @description 기수 생성 Zod 스키마
 * 기수 순서와 리더 ID를 포함합니다.
 */
export const CreateGenerationSchema = z
  .object({
    order: z
      .number({ invalid_type_error: "기수는 숫자여야 합니다." })
      .multipleOf(0.5, { message: "기수는 0.5 단위여야 합니다." }),

    leaderId: z
      .number({ invalid_type_error: "리더 ID는 숫자여야 합니다." })
      .int("리더 ID는 정수여야 합니다.")
      .optional()
  })
  .strict()

/**
 * @description 기수 생성 DTO 클래스 (백엔드용)
 */
export class CreateGenerationDto extends createZodDto(CreateGenerationSchema) {}

/**
 * @description 기수 생성 타입 (프론트엔드용)
 */
export type CreateGeneration = z.infer<typeof CreateGenerationSchema>
