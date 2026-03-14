import zod from "zod"
import {
  dateValidationRefine,
  PartialPerformanceObjectSchema
} from "./performance.schema"

/**
 * @description 공연 업데이트 Zod 스키마
 * 모든 필드를 선택적으로 만들어서 부분 업데이트를 지원합니다.
 */
export const UpdatePerformanceSchema = PartialPerformanceObjectSchema.refine(
  dateValidationRefine,
  {
    message: "종료 일시는 시작 일시보다 이후여야 합니다."
  }
)

export type UpdatePerformance = zod.infer<typeof UpdatePerformanceSchema>

/**
 * @description API 요청용 공연 업데이트 Zod 스키마
 */
export const UpdatePerformanceApiSchema = PartialPerformanceObjectSchema.refine(
  dateValidationRefine,
  {
    message: "종료 일시는 시작 일시보다 이후여야 합니다."
  }
)
