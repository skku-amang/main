import { z } from "zod"

export const TeamSessionSchema = z.object({
  sessionId: z.number().int().positive(),
  capacity: z.number().int().positive("세션 정원은 1 이상이어야 합니다."),
  members: z.array(
    z.object({
      userId: z.number().int().positive(),
      index: z.number().int().positive("인덱스는 1 이상이어야 합니다.")
    })
  )
})

export const CreateTeamSchema = z.object({
  name: z.string().min(1, "팀 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  leaderId: z.number().int().positive("팀 리더 ID는 정수여야 합니다."),
  // performanceId: z.number().int("공연 ID는 정수여야 합니다.").positive(),
  posterImage: z
    .string()
    .url("포스터 이미지 URL은 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  songName: z.string().min(1, "노래 이름은 필수입니다."),
  songArtist: z.string().min(1, "노래 아티스트는 필수입니다."),
  isFreshmenFixed: z.boolean().default(false),
  isSelfMade: z.boolean().default(false),
  songYoutubeVideoUrl: z
    .string()
    .url("유튜브 영상 URL은 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  memberSessions: z.array(TeamSessionSchema)
})

export type CreateTeam = z.infer<typeof CreateTeamSchema>
