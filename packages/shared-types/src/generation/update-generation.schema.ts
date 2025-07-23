import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { CreateGenerationSchema } from "./create-generation.schema"

/**
 * @description 기수 업데이트 Zod 스키마
 * 모든 필드를 선택적으로 만들어서 부분 업데이트를 지원합니다.
 */
export const UpdateGenerationSchema = CreateGenerationSchema.partial().strict()

/**
 * @description 기수 업데이트 DTO 클래스 (백엔드용)
 */
export class UpdateGenerationDto extends createZodDto(UpdateGenerationSchema) {}

/**
 * @description 기수 업데이트 타입 (프론트엔드용)
 */
export type UpdateGeneration = z.infer<typeof UpdateGenerationSchema>
