import { z } from "zod"

const idSchema = z.number().int().positive()

/**
 * @description 알림이 가리키는 대상(팀 또는 공연) 하나를 지정해 그 대상의 안 읽은 알림을 읽음 처리한다.
 * 그 대상 페이지에 도달했을 때 web이 호출한다.
 */
export const MarkNotificationsReadBySubjectSchema = z
  .object({
    teamId: idSchema.optional(),
    performanceId: idSchema.optional()
  })
  .refine(
    (v) => (v.teamId === undefined) !== (v.performanceId === undefined),
    "teamId와 performanceId 중 하나만 보내야 합니다."
  )

export type MarkNotificationsReadBySubject = z.infer<
  typeof MarkNotificationsReadBySubjectSchema
>
