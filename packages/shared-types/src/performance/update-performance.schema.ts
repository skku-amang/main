import z from "zod"
import {
  PerformanceObjectSchema,
  dateValidationRefine
} from "./performance.schema"

/**
 * @description 공연 업데이트 Zod 스키마
 * 모든 필드를 선택적으로 만들어서 부분 업데이트를 지원합니다.
 */
export const UpdatePerformanceSchema = PerformanceObjectSchema.partial().refine(
  dateValidationRefine,
  {
    message: "종료 일시는 시작 일시보다 이후여야 합니다.",
    path: ["endDateTime"]
  }
)

/**
 * @description 공연 수정 타입 (프론트엔드용)
 */
export type UpdatePerformance = z.infer<typeof UpdatePerformanceSchema>
