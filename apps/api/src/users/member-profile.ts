import { Prisma } from "@repo/database"
import {
  getPerformanceStage,
  isMemberMaskedStage,
  MemberProfile,
  MemberProfileTeam
} from "@repo/shared-types"

const profileTeamSelect = {
  id: true,
  songName: true,
  songArtist: true,
  Performance: {
    select: {
      id: true,
      name: true,
      startAt: true,
      // 피드백 기간 팀원 가림 판정용. 응답에는 넣지 않는다
      recruitStartAt: true,
      recruitEndAt: true,
      feedbackStartAt: true,
      feedbackEndAt: true,
      decidedAt: true,
      endAt: true
    }
  }
} satisfies Prisma.TeamSelect

export const memberProfileSelect = {
  id: true,
  name: true,
  image: true,
  nickname: true,
  bio: true,
  isProfilePublic: true,
  generation: { select: { id: true, order: true } },
  sessions: { select: { id: true, name: true } },
  leadingTeams: { select: profileTeamSelect },
  joinedTeams: {
    select: {
      teamSession: {
        select: {
          session: { select: { name: true } },
          team: { select: profileTeamSelect }
        }
      }
    }
  }
} satisfies Prisma.UserSelect

type ProfileRow = Prisma.UserGetPayload<{ select: typeof memberProfileSelect }>
type ProfileTeamRow = ProfileRow["leadingTeams"][number]

export function toMemberProfile(
  user: ProfileRow,
  viewerId: number,
  now: Date = new Date()
): MemberProfile {
  const base = {
    id: user.id,
    name: user.name,
    image: user.image,
    nickname: user.nickname,
    generation: user.generation,
    sessions: user.sessions
  }
  if (!user.isProfilePublic && user.id !== viewerId)
    return { ...base, isPublic: false }

  // 팀장이면서 팀원(여러 세션)일 수 있어 팀 단위로 합친다
  const teams = new Map<number, MemberProfileTeam>()
  const entry = (team: ProfileTeamRow) => {
    let found = teams.get(team.id)
    if (!found) {
      found = {
        id: team.id,
        songName: team.songName,
        songArtist: team.songArtist,
        performance: {
          id: team.Performance.id,
          name: team.Performance.name,
          startAt: team.Performance.startAt
        },
        isLeader: false,
        sessions: []
      }
      teams.set(team.id, found)
    }
    return found
  }
  // 피드백 기간 공연의 팀은 빼고 응답한다 — 안 빼면 팀원 가림이 여기로 샌다 (설계 5.2)
  const visible = (team: ProfileTeamRow) =>
    !isMemberMaskedStage(getPerformanceStage(team.Performance, now))
  for (const team of user.leadingTeams.filter(visible))
    entry(team).isLeader = true
  for (const { teamSession } of user.joinedTeams)
    if (visible(teamSession.team))
      entry(teamSession.team).sessions.push(teamSession.session.name)

  return {
    ...base,
    isPublic: true,
    bio: user.bio,
    teams: [...teams.values()].sort(
      (a, b) =>
        (b.performance.startAt?.getTime() ?? 0) -
        (a.performance.startAt?.getTime() ?? 0)
    )
  }
}
