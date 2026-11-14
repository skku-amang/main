import { z } from "zod"
import {
  FEEDBACK_COMMENT_MAX,
  FEEDBACK_DIMENSIONS,
  FEEDBACK_SCORE_MIN
} from "./feedback"

const score = (max: number) =>
  z.number().int("점수는 정수여야 합니다.").min(FEEDBACK_SCORE_MIN).max(max)

const [team, individual, preference] = FEEDBACK_DIMENSIONS

/** 보낸 필드만 바꾼다. 빈 의견은 null(지우기) */
export const UpsertFeedbackSchema = z
  .object({
    [team.key]: score(team.max).optional(),
    [individual.key]: score(individual.max).optional(),
    [preference.key]: score(preference.max).optional(),
    comment: z
      .string()
      .trim()
      .max(FEEDBACK_COMMENT_MAX)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: "바꿀 항목이 없습니다."
  })

export type UpsertFeedback = z.infer<typeof UpsertFeedbackSchema>
