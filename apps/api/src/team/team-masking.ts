import {
  getPerformanceStage,
  HIDDEN_USER_ID,
  isMemberMaskedStage
} from "@repo/shared-types"
import { isUserAdmin } from "../auth/is-admin.util"
import { PrismaService } from "../prisma/prisma.service"

const HIDDEN_USER: Record<string, unknown> = {
  id: HIDDEN_USER_ID,
  name: "비공개",
  image: null,
  nickname: null,
  generation: null,
  sessions: []
}

type MaskableTeam = {
  performanceId: number
  leaderId: number
  leader: object
  teamSessions?: { id: number; members?: { userId: number; user: object }[] }[]
}

// 원래 select 모양(키 집합)을 유지해야 응답 타입이 그대로다
const hiddenLike = <U extends object>(user: U): U =>
  Object.fromEntries(
    Object.keys(user).map((key) => [key, HIDDEN_USER[key] ?? null])
  ) as U

/** 팀장·멤버를 자리표시 사용자로 바꾼다. 세션·자리 수·순서는 그대로 (모집 충족 계산 유지) */
export const maskTeam = <T extends MaskableTeam>(
  team: T
): T & { membersHidden: true } => ({
  ...team,
  leaderId: HIDDEN_USER_ID,
  leader: hiddenLike(team.leader),
  ...(team.teamSessions && {
    teamSessions: team.teamSessions.map((teamSession) => ({
      ...teamSession,
      ...(teamSession.members && {
        members: teamSession.members.map((member) => ({
          ...member,
          userId: HIDDEN_USER_ID,
          user: hiddenLike(member.user)
        }))
      })
    }))
  }),
  membersHidden: true
})

/**
 * 피드백·집계 단계 공연의 팀은 운영진이 아니면(비로그인 포함) 팀원을 가린다 (설계 5.2).
 */
export const maskTeamsFor = async <T extends MaskableTeam>(
  prisma: PrismaService,
  teams: T[],
  viewerId: number | undefined,
  now: Date = new Date()
): Promise<(T & { membersHidden?: true })[]> => {
  const performanceIds = [...new Set(teams.map((t) => t.performanceId))]
  if (performanceIds.length === 0) return teams

  const performances = await prisma.performance.findMany({
    where: { id: { in: performanceIds } },
    select: {
      id: true,
      recruitStartAt: true,
      recruitEndAt: true,
      feedbackStartAt: true,
      feedbackEndAt: true,
      decidedAt: true,
      endAt: true
    }
  })
  const masked = new Set(
    performances
      .filter((p) => isMemberMaskedStage(getPerformanceStage(p, now)))
      .map((p) => p.id)
  )
  if (masked.size === 0) return teams
  if (viewerId !== undefined && (await isUserAdmin(prisma, viewerId)))
    return teams

  return teams.map((t) => (masked.has(t.performanceId) ? maskTeam(t) : t))
}
