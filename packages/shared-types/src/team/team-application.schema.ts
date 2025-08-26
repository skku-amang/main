import { z } from "zod"

export const TeamPositionSchema = z.object({
  sessionId: z.number().int("세션 ID는 정수여야 합니다.").positive(),
  index: z.number().int("인덱스는 정수여야 합니다.").positive()
})

export const TeamApplicationSchema = z.array(TeamPositionSchema)

export type TeamApplication = z.infer<typeof TeamApplicationSchema>
