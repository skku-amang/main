import { z } from "zod"

/** null = 녹음본 삭제 */
export const UpdateTeamRecordingSchema = z.object({
  recordingUrl: z.string().url("녹음본 주소가 올바르지 않습니다.").nullable()
})

export type UpdateTeamRecording = z.infer<typeof UpdateTeamRecordingSchema>
