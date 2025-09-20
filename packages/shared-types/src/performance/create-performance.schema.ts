import z from "zod"
import {
  PerformanceObjectSchema,
  dateValidationRefine
} from "./performance.schema"

/**
 * @description 공연 생성 Zod 스키마
 * 공연 이름과 설명, 대표 이미지 등을 포함합니다.
 */
export const CreatePerformanceSchema = PerformanceObjectSchema.refine(
  dateValidationRefine,
  {
    message: "종료 일시는 시작 일시보다 이후여야 합니다.",
    path: ["endDateTime"]
  }
)

/**
 * @description 공연 생성 타입 (프론트엔드용)
 */
export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>
