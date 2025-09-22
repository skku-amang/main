import z from "zod"
import {
  dateValidationRefine,
  PerformanceObjectSchema
} from "./performance.schema"

/**
 * @description 공연 생성 Zod 스키마
 * 공연 이름과 설명, 공연 포스터 이미지 등을 포함합니다.
 */
export const CreatePerformanceSchema = PerformanceObjectSchema.refine(
  dateValidationRefine,
  {
    message: "종료 일시는 시작 일시보다 이후여야 합니다.",
    path: ["endAt"]
  }
)
export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>

/**
 * @description API 요청용 공연 생성 Zod 스키마
 * posterImage 필드를 제외하여 파일 업로드를 별도로 처리할 수 있도록 합니다.
 */
export const CreatePerformanceApiSchema = PerformanceObjectSchema.omit({
  posterImage: true
}).refine(dateValidationRefine, {
  message: "종료 일시는 시작 일시보다 이후여야 합니다.",
  path: ["endAt"]
})
