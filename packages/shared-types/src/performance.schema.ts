import z from "zod"

export const CreatePerformanceSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().optional(),
  posterImage: z
    .string()
    .url("대표 이미지 URL은 유효한 URL이어야 합니다()")
    .optional(),
  location: z.string().optional(),
  startAt: z.string().datetime("시작 날짜는 유효한 날짜여야 합니다."),
  endAt: z.string().datetime("종료 날짜는 유효한 날짜여야 합니다."),
  status: z.enum(["예정", "진행중", "종료"]) // TODO: prisma enum으로 변경
})

export const UpdatePerformanceSchema = CreatePerformanceSchema.partial()
