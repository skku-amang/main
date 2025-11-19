import z from "zod"
import {
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES
} from "../constants/file-validation"

export const PerformanceObjectSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  posterImage: z
    .instanceof(File)
    .refine((file) => file.size < MAX_FILE_SIZE, {
      message: "File can't be bigger than 20MB."
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: `파일 확장자는 ${ACCEPTED_IMAGE_TYPES.map((t) =>
        t.replace("image/", "")
      ).join(", ")} 만 가능합니다.`
    })
    .nullable()
    .optional(),
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
