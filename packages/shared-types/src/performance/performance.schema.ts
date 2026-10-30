import z from "zod"
import { safeString, safeNullableString } from "../constants/sanitization"

export const PerformanceObjectSchema = z.object({
  name: safeString({ max: 100, message: "공연 이름은 필수입니다." }),
  description: safeNullableString({ max: 1000 }),
  image: z.string().nullable().optional(),
  location: safeNullableString({ max: 200 }),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),
  recruitStartAt: z.coerce.date().nullable().optional(),
  recruitEndAt: z.coerce.date().nullable().optional(),
  feedbackStartAt: z.coerce.date().nullable().optional(),
  feedbackEndAt: z.coerce.date().nullable().optional(),
  passCount: z.number().int().positive().nullable().optional(),
  penaltyPerMissingReview: z.number().min(0).optional()
})

export const PartialPerformanceObjectSchema = PerformanceObjectSchema.partial()

export const GetPerformancesQuerySchema = z.object({
  status: z.enum(["recruiting"]).optional()
})

export type GetPerformancesQuery = z.infer<typeof GetPerformancesQuerySchema>

type ScheduleDates = Partial<
  Record<
    | "startAt"
    | "endAt"
    | "recruitStartAt"
    | "recruitEndAt"
    | "feedbackStartAt"
    | "feedbackEndAt",
    Date | null | undefined
  >
>

const SCHEDULE_ORDER = [
  ["recruitStartAt", "모집 시작"],
  ["recruitEndAt", "모집 종료"],
  ["feedbackStartAt", "피드백 시작"],
  ["feedbackEndAt", "피드백 종료"]
] as const

/** 일정 순서가 깨졌으면 사용자 문구를, 아니면 null. 비어 있는 날짜는 건너뛴다. */
export const validatePerformanceSchedule = (
  d: ScheduleDates
): string | null => {
  if (d.startAt && d.endAt && d.endAt < d.startAt)
    return "종료 일시는 시작 일시보다 이후여야 합니다."

  const filled = SCHEDULE_ORDER.flatMap(([key, label]) => {
    const at = d[key]
    return at ? [{ at, label }] : []
  })
  for (let i = 1; i < filled.length; i++) {
    const prev = filled[i - 1]!
    const cur = filled[i]!
    if (cur.at < prev.at)
      return `${cur.label} 일시는 ${prev.label} 일시보다 이후여야 합니다.`
  }
  return null
}

export const scheduleRefine = (d: ScheduleDates, ctx: z.RefinementCtx) => {
  const message = validatePerformanceSchedule(d)
  if (message) ctx.addIssue({ code: "custom", message })
}
