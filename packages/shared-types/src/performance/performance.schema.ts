import z from "zod"

export const PerformanceObjectSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  representativeImage: z
    .string()
    .url("이미지는 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  location: z.string().nullable().optional(),
  startDateTime: z.coerce.date().nullable().optional(),
  endDateTime: z.coerce.date().nullable().optional()
})

export const PartialPerformanceObjectSchema = PerformanceObjectSchema.partial()

export const dateValidationRefine = (
  data: z.infer<typeof PartialPerformanceObjectSchema>
) => {
  if (data.startDateTime && data.endDateTime) {
    return data.endDateTime >= data.startDateTime
  }
  return true
}
