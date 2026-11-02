import { z } from "zod"
import {
  FEEDBACK_COMMENT_MAX,
  FEEDBACK_SCORE_MAX,
  FEEDBACK_SCORE_MIN
} from "./feedback"

const score = z
  .number()
  .int("점수는 정수여야 합니다.")
  .min(FEEDBACK_SCORE_MIN)
  .max(FEEDBACK_SCORE_MAX)

/** 보낸 필드만 바꾼다. 빈 의견은 null(지우기) */
export const UpsertFeedbackSchema = z
  .object({
    teamScore: score.optional(),
    individualScore: score.optional(),
    preferenceScore: score.optional(),
    comment: z
      .string()
      .trim()
      .max(FEEDBACK_COMMENT_MAX)
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v))
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: "바꿀 항목이 없습니다."
  })

export type UpsertFeedback = z.infer<typeof UpsertFeedbackSchema>
