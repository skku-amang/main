import { Performance } from "./Performance"
import { SessionName } from "./Session"
import { User } from "./User"

export type Team = {
  id: number
  name?: string
  description: string
  leader: User
  performance: Performance
  posterImage?: string

  songName: string
  songArtist: string
  isFreshmenFixed: boolean
  isSelfMade: boolean
  songYoutubeVideoUrl?: string // 아망 공식 홈페이지 유튜브 영상

  createdDatetime: string
  updatedDatetime: string

  memberSessions?: MemberSession[]
}

export type Song = {
  name: string
  artist: string
  coverName?: string
  coverArtist?: string
  originalUrl: string
  coverUrl?: string
}

/**
 * 팀의 세션별 멤버 정보
 * @param requiredMemberCount 세션별 필요한 멤버 수
 * 만약 `members`의 길이가 2이고 `requiredMemberCount`가 3이면
 * 해당 세션에 멤버가 2명이 있지만 아직 세션에 멤버가 1명이 부족한 상황
 */
export type MemberSession = {
  id: number
  session: SessionName
  members: (User | null)[]
}
export type MemberSessionMembership = {
  id: number
  session: string
  member: User
  index: number
}
export const SessionOrder = [
  "보컬",
  "기타",
  "베이스",
  "드럼",
  "신디",
  "현악기",
  "관악기"
]

/**
 * 팀의 세션별 멤버 정보를 담은 Set
 * MemberSession의 상위 Class로서 세션별 필요한 멤버 수를 계산합니다.
 */
export class MemberSessionSet {
  private readonly memberSessions: Set<MemberSession>

  constructor(memberSessions?: MemberSession[]) {
    if (!memberSessions) {
      this.memberSessions = new Set()
    } else {
      if (
        !this.isSessionsUnique(
          memberSessions.map((memberSession) => memberSession.session)
        )
      ) {
        throw new Error("MemberSessionSet의 세션은 모두 고유해야 합니다.")
      }
      this.memberSessions = new Set(memberSessions)
    }
  }

  private isSessionsUnique(sessions: SessionName[]): boolean {
    return sessions.length === new Set(sessions).size
  }

  getRequiredSessionsWithMissingUserCount(
    includeFullSessions = false
  ): Map<SessionName, number> {
    const requiredSessionsWithMissingUserCount: Map<SessionName, number> =
      new Map()
    Array.from(this.memberSessions).map((ms) => {
      const requiredMemberCount =
        MemberSessionSet.getRequiredMemberCountOfMemberSession(ms)

      if (requiredMemberCount > 0) {
        requiredSessionsWithMissingUserCount.set(
          ms.session,
          requiredMemberCount
        )
      } else if (includeFullSessions) {
        requiredSessionsWithMissingUserCount.set(ms.session, 0)
      }
    })
    return requiredSessionsWithMissingUserCount
  }

  getSatisfiedSessions() {
    return Array.from(this.memberSessions).filter((ms) => {
      const requiredMemberCount =
        MemberSessionSet.getRequiredMemberCountOfMemberSession(ms)
      return requiredMemberCount === ms.members.length
    })
  }

  getSessionsWithAtleastOneMember() {
    return Array.from(this.memberSessions).filter(
      (ms) => ms.members.filter((member) => member !== null).length > 0
    )
  }

  get isSatisfied(): boolean {
    return this.getRequiredSessionsWithMissingUserCount().size === 0
  }

  static from(memberSessions: MemberSession[]): MemberSessionSet {
    return new MemberSessionSet(memberSessions)
  }

  getSessionsWithMissingMembers() {
    return Array.from(this.memberSessions).filter((ms) => {
      const requiredMemberCount =
        MemberSessionSet.getRequiredMemberCountOfMemberSession(ms)
      return requiredMemberCount > 0
    })
  }

  isEmpty() {
    return this.memberSessions.size === 0
  }

  static getRequiredMemberCountOfMemberSession(memberSession: MemberSession) {
    return memberSession.members.filter((member) => member === null).length
  }
}
