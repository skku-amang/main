import { PerformanceTeamsList } from "@repo/shared-types"

// PerformanceTeamsList의 단일 팀 타입
export type TeamFromList = PerformanceTeamsList[number]

// 팀의 teamSessions 타입
export type TeamSessionFromList = TeamFromList["teamSessions"][number]

// teamSession의 member 타입
export type TeamSessionMember = TeamSessionFromList["members"][number]

/**
 * 팀의 모든 세션이 정원을 충족했는지 확인
 */
export function isTeamSatisfied(teamSessions: TeamSessionFromList[]): boolean {
  return teamSessions.every((ts) => ts.members.length >= ts.capacity)
}

/**
 * 빈 자리가 있는 세션 목록 반환
 */
export function getSessionsWithMissingMembers(
  teamSessions: TeamSessionFromList[]
): TeamSessionFromList[] {
  return teamSessions.filter((ts) => ts.members.length < ts.capacity)
}

/**
 * 특정 세션에서 빈 인덱스 목록 반환 (1-based)
 */
export function getMissingIndices(ts: TeamSessionFromList): number[] {
  const filledIndices = new Set(ts.members.map((m) => m.index))
  const missing: number[] = []
  for (let i = 1; i <= ts.capacity; i++) {
    if (!filledIndices.has(i)) {
      missing.push(i)
    }
  }
  return missing
}

/**
 * 세션 이름으로 그룹화된 빈 자리 정보 반환
 */
export function getMissingSessionSlots(
  teamSessions: TeamSessionFromList[]
): { sessionName: string; sessionId: number; missingIndices: number[] }[] {
  return teamSessions
    .map((ts) => ({
      sessionName: ts.session.name,
      sessionId: ts.session.id,
      missingIndices: getMissingIndices(ts)
    }))
    .filter((slot) => slot.missingIndices.length > 0)
}
