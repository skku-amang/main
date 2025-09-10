import { z } from "zod"
import { CreateTeamSchema } from "./create-team.schema"

export const UpdateTeamSchema = CreateTeamSchema.omit({
  // performanceId: true
})

export type UpdateTeam = z.infer<typeof UpdateTeamSchema>
