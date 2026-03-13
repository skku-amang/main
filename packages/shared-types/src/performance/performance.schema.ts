import z from "zod"

export const PerformanceObjectSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  posterImage: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
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
