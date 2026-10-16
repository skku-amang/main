import { getSessionDisplayName, SESSION_NAMES } from "@/constants/session"

import { TeamFromList, TeamSessionMember } from "./teamSession"

/** 표의 세션 열 하나 = 세션의 몇 번째 자리 (예: 기타 2번 자리) */
export type RosterSlot = {
  sessionName: string
  index: number
  label: string
}

export type RosterCell =
  | { kind: "member"; member: TeamSessionMember; sessionId: number }
  | { kind: "open"; sessionId: number }
  | { kind: "none" }

const SESSION_ORDER: string[] = Object.values(SESSION_NAMES)

/**
 * 팀들에 있는 세션을 모아 열을 만든다. 정원이 가장 큰 팀 기준으로 자리 수를 정하고,
 * 자리가 하나뿐인 세션은 번호 없이 이름만 쓴다.
 */
export function getRosterSlots(teams: TeamFromList[]): RosterSlot[] {
  const maxCapacity = new Map<string, number>()
  for (const team of teams)
    for (const ts of team.teamSessions)
      maxCapacity.set(
        ts.session.name,
        Math.max(maxCapacity.get(ts.session.name) ?? 0, ts.capacity)
      )

  return [...maxCapacity.entries()]
    .sort(([a], [b]) => SESSION_ORDER.indexOf(a) - SESSION_ORDER.indexOf(b))
    .flatMap(([sessionName, capacity]) =>
      Array.from({ length: capacity }, (_, i) => ({
        sessionName,
        index: i + 1,
        label:
          capacity > 1
            ? `${getSessionDisplayName(sessionName)}${i + 1}`
            : getSessionDisplayName(sessionName)
      }))
    )
}

/** 이 팀의 그 자리: 맡은 사람 / 빈자리(모집) / 이 팀엔 없는 자리 */
export function getRosterCell(
  team: TeamFromList,
  slot: RosterSlot
): RosterCell {
  const ts = team.teamSessions.find((s) => s.session.name === slot.sessionName)
  if (!ts || slot.index > ts.capacity) return { kind: "none" }
  const member = ts.members.find((m) => m.index === slot.index)
  return member
    ? { kind: "member", member, sessionId: ts.session.id }
    : { kind: "open", sessionId: ts.session.id }
}
