import type { UpdateTeam } from "@repo/shared-types"

export const TEAM_EVENTS = {
  CREATED: "team.created",
  UPDATED: "team.updated",
  MEMBER_ADDED: "team.member.added",
  MEMBER_REMOVED: "team.member.removed",
  LEADER_CHANGED: "team.leader.changed",
  DELETED: "team.deleted"
} as const

export class TeamLeaderChangedEvent {
  constructor(
    readonly teamId: number,
    readonly newLeaderId: number,
    readonly formerLeaderId: number,
    readonly actorId: number
  ) {}
}

/** 삭제 뒤엔 팀을 조회할 수 없으므로 수신자·팀명을 이벤트가 들고 간다 */
export class TeamDeletedEvent {
  constructor(
    readonly teamId: number,
    readonly teamName: string,
    readonly performanceId: number,
    readonly memberIds: number[],
    readonly actorId: number
  ) {}
}

export class TeamCreatedEvent {
  constructor(
    readonly teamId: number,
    readonly actorId: number
  ) {}
}

export class TeamUpdatedEvent {
  constructor(
    readonly teamId: number,
    readonly changedFields: string[],
    readonly actorId: number
  ) {}
}

export class TeamMemberAddedEvent {
  constructor(
    readonly teamId: number,
    readonly userId: number,
    readonly sessionIds: number[],
    readonly actorId: number
  ) {}
}

export class TeamMemberRemovedEvent {
  constructor(
    readonly teamId: number,
    readonly userId: number,
    readonly sessionIds: number[],
    readonly actorId: number
  ) {}
}

type RosterSession = { sessionId: number; members: { userId: number }[] }

/** userId → 그 유저가 속한 sessionId 목록 */
function membershipOf(sessions: RosterSession[]) {
  const map = new Map<number, number[]>()
  for (const { sessionId, members } of sessions)
    for (const { userId } of members)
      map.set(userId, [...(map.get(userId) ?? []), sessionId])
  return map
}

/**
 * 로스터 변경 전후를 (userId, sessionId) 단위로 비교한다.
 * 같은 세션에 남아 있으면 자리(index)가 바뀌어도 변화로 보지 않는다.
 */
export function diffRoster(before: RosterSession[], after: RosterSession[]) {
  const prev = membershipOf(before)
  const next = membershipOf(after)
  const added = new Map<number, number[]>()
  const removed = new Map<number, number[]>()

  for (const [userId, sessionIds] of next) {
    const gained = sessionIds.filter((s) => !prev.get(userId)?.includes(s))
    if (gained.length > 0) added.set(userId, gained)
  }
  for (const [userId, sessionIds] of prev) {
    const lost = sessionIds.filter((s) => !next.get(userId)?.includes(s))
    if (lost.length > 0) removed.set(userId, lost)
  }
  return { added, removed }
}

const SCALAR_FIELDS = [
  "name",
  "description",
  "image",
  "songName",
  "songArtist",
  "isFreshmenFixed",
  "isSelfMade",
  "songYoutubeVideoUrl",
  "leaderId",
  "performanceId"
] as const

type ExistingTeam = Record<(typeof SCALAR_FIELDS)[number], unknown> & {
  teamSessions: { sessionId: number; capacity: number }[]
}

/**
 * 수정 요청이 실제로 바꾸는 필드 이름 목록. 세션 구성(세션 집합·정원)이 바뀌면 "sessions".
 * 멤버 변경은 여기 포함하지 않는다 (diffRoster가 담당).
 */
export function changedTeamFields(existing: ExistingTeam, dto: UpdateTeam) {
  const changed: string[] = []

  for (const field of SCALAR_FIELDS) {
    const incoming = dto[field]
    // performanceId만 "안 보내면 유지". 나머지 nullable 필드는 update가 `?? null`로 써서 생략 = null
    if (field === "performanceId" && incoming === undefined) continue
    if ((incoming ?? null) !== (existing[field] ?? null)) changed.push(field)
  }

  const capacityBySession = new Map(
    existing.teamSessions.map((s) => [s.sessionId, s.capacity])
  )
  const sessionsChanged =
    dto.memberSessions.length !== capacityBySession.size ||
    dto.memberSessions.some(
      (s) => capacityBySession.get(s.sessionId) !== s.capacity
    )
  if (sessionsChanged) changed.push("sessions")

  return changed
}
