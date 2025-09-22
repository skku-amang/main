import z from "zod"

const MAX_FILE_SIZE = 20000000 // 20MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]
export const CreatePerformanceSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().optional(),
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
    .optional(),
  location: z.string().optional(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  status: z.enum(["예정", "진행중", "종료"]).optional().default("예정") // TODO: prisma enum으로 변경
})
export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>

export const UpdatePerformanceSchema = CreatePerformanceSchema.partial()
export type UpdatePerformance = z.infer<typeof UpdatePerformanceSchema>
