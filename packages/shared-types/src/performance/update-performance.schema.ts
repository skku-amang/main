import zod from "zod"
import {
  PartialPerformanceObjectSchema,
  scheduleRefine
} from "./performance.schema"

/**
 * @description 공연 업데이트 Zod 스키마
 * 모든 필드를 선택적으로 만들어서 부분 업데이트를 지원합니다.
 */
export const UpdatePerformanceSchema =
  PartialPerformanceObjectSchema.superRefine(scheduleRefine)

export type UpdatePerformance = zod.infer<typeof UpdatePerformanceSchema>

/**
 * @description API 요청용 공연 업데이트 Zod 스키마
 */
export const UpdatePerformanceApiSchema =
  PartialPerformanceObjectSchema.superRefine(scheduleRefine)
