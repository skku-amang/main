import { SessionName } from "@repo/database"
import z from "zod"

// TODO: 세션명 제대로 List로 나오는지 확인 필요
const sessionNames = Object.values(SessionName) as [
  SessionName,
  ...SessionName[]
]

/**
 * 각 팀에 소속된 멤버의 세션(with 몇 번째 인지도) 정보
 * 예: { userId: 1, session: "기타", index: 2 } => 유저 ID 1은 기타2 세션
 */
export const MemberSessionIndexSchema = z.object({
  userId: z.number().int("유저 ID는 정수여야 합니다.").positive(),
  session: z.enum(sessionNames),
  index: z.number().int("인덱스는 정수여야 합니다.").positive()
})

export const CreateTeamSchema = z.object({
  name: z.string().min(1, "팀 이름은 필수입니다."),
  description: z.string().optional(),
  leader: z.number().int("팀 리더 ID는 정수여야 합니다."),
  performanceId: z.number().int("공연 ID는 정수여야 합니다.").positive(),
  posterImage: z
    .string()
    .url("포스터 이미지 URL은 유효한 URL이어야 합니다()")
    .optional(),
  songName: z.string().min(1, "노래 이름은 필수입니다."),
  songArtist: z.string().min(1, "노래 아티스트는 필수입니다."),
  isFreshmenFixed: z.boolean().default(false),
  isSelfMade: z.boolean().default(false),
  songYoutubeVideoUrl: z
    .string()
    .url("유튜브 영상 URL은 유효한 URL이어야 합니다()")
    .optional(),
  memberSessions: z.array(MemberSessionIndexSchema).optional()
})
export type CreateTeam = z.infer<typeof CreateTeamSchema>

export const UpdateTeamSchema = CreateTeamSchema.partial()
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>

/**
 * 프론트엔드에서 유저가 팀 신청 시 입력하는 정보
 * - `userId`는 토큰을 통해 가져오므로 클라이언트에서 입력하지 않음
 * - apply, unapply 구분은 API 경로를 통해 처리하므로 필요 없음(예: `POST /api/teams/:teamId/unapply`)
 */
export const TeamApplicationSchema = MemberSessionIndexSchema.omit({
  userId: true
})
export type TeamApplication = z.infer<typeof TeamApplicationSchema>
