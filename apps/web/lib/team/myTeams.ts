type TeamWithMembers = {
  createdAt: Date | string
  leader: { id: number }
  teamSessions: {
    members: { createdAt: Date | string; user: { id: number } }[]
  }[]
}

/** 내가 팀장으로 만든 시각과 세션에 지원한 시각 중 가장 최근. 관련 없는 팀이면 null */
function getMyLastActivityAt(team: TeamWithMembers, userId: number) {
  const times = team.teamSessions
    .flatMap((ts) => ts.members)
    .filter((m) => m.user.id === userId)
    .map((m) => new Date(m.createdAt).getTime())
  if (team.leader.id === userId) times.push(new Date(team.createdAt).getTime())
  return times.length > 0 ? Math.max(...times) : null
}

/** 내가 팀장이거나 멤버인 팀을 최근 활동순으로 */
export function getMyTeams<T extends TeamWithMembers>(
  teams: T[] | undefined,
  userId: number
): T[] {
  return (teams ?? [])
    .map((team) => ({ team, at: getMyLastActivityAt(team, userId) }))
    .filter((x): x is { team: T; at: number } => x.at !== null)
    .sort((a, b) => b.at - a.at)
    .map((x) => x.team)
}
