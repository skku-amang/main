import z from "zod"
import { safeString, safeNullableString } from "../constants/sanitization"

export const PerformanceObjectSchema = z.object({
  name: safeString({ max: 100, message: "공연 이름은 필수입니다." }),
  description: safeNullableString({ max: 1000 }),
  posterImage: z.string().url().nullable().optional(),
  location: safeNullableString({ max: 200 }),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional()
})

export const PartialPerformanceObjectSchema = PerformanceObjectSchema.partial()

export const dateValidationRefine = (
  data: z.infer<typeof PartialPerformanceObjectSchema>
) => {
  if (data.startAt && data.endAt) {
    return data.endAt >= data.startAt
  }
  return true
}
