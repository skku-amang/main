import z from "zod"
import { PerformanceObjectSchema, scheduleRefine } from "./performance.schema"

/**
 * @description 공연 생성 Zod 스키마
 * 공연 이름과 설명, 공연 포스터 이미지 등을 포함합니다.
 */
export const CreatePerformanceSchema =
  PerformanceObjectSchema.superRefine(scheduleRefine)
export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>

/**
 * @description API 요청용 공연 생성 Zod 스키마
 */
export const CreatePerformanceApiSchema =
  PerformanceObjectSchema.superRefine(scheduleRefine)
