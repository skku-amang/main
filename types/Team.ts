import { Performance } from "./Performance"
import { SessionName } from "./Session"
import { User } from "./User"

export type Team = {
  id: number
  name?: string
  description: string
  leader?: User
  performance: Performance
  isFreshmanFixed: boolean
  posterImage?: string

  songName: string
  songArtist: string
  songYoutubeVideoId?: string // 아망 공식 홈페이지 유튜브 영상

  createdDatetime: string
  updatedDatetime: string

  memberSessions?: MemberSession[]
}
// TODO: 각 모델별 DTO 작성: API에서 받은 JSON 형태 정의
// TODO: 각 모델별 refine 함수 작성 -> DTO를 받아서 해당 모델로 변환

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
  members: User[]
  requiredMemberCount: number
}

/**
 * 팀의 세션별 멤버 정보를 담은 Set
 * MemberSession의 상위 Class로서 세션별 필요한 멤버 수를 계산합니다.
 */
export class MemberSessionSet {
  private readonly memberSessions: Set<MemberSession>

  constructor(memberSessions: MemberSession[]) {
    if (
      !this.isSessionsUnique(
        memberSessions.map((memberSession) => memberSession.session)
      )
    ) {
      throw new Error("MemberSessionSet의 세션은 모두 고유해야 합니다.")
    }
    this.memberSessions = new Set(memberSessions)
  }

  private isSessionsUnique(sessions: SessionName[]): boolean {
    return sessions.length === new Set(sessions).size
  }

  /**
   * 세션별 필요한 멤버 수를 계산합니다.
   * @param includeFullSessions 충족된 세션도 반환할지 여부(default: false)
   * @returns 세션별 필요한 멤버 수를 모두 더한 값
   * @example
   * const memberSessions = new MemberSessionSet([
   *  {
   *    session: 보컬,
   *    members: [멤버1, 멤버2],
   *    requiredMemberCount: 3
   *  },
   *  {
   *    session: dummySessions[1],
   *    members: [멤버3],
   *    requiredMemberCount: 1
   *  }
   * ])
   *
   * memberSessions.getRequiredSessionsWithMissingUserCount(true)
   * // Map {
   * //   Session 보컬: 1
   * //   Session 기타: 0
   * // }
   * memberSessions.getRequiredSessionsWithMissingUserCount(false)
   * // Map {
   * //   Session 보컬: 1
   * // }
   */
  getRequiredSessionsWithMissingUserCount(
    includeFullSessions = false
  ): Map<SessionName, number> {
    let requiredSessionsWithMissingUserCount: Map<SessionName, number> =
      new Map()
    Array.from(this.memberSessions).map((memberSession) => {
      if (memberSession.members.length < memberSession.requiredMemberCount) {
        requiredSessionsWithMissingUserCount.set(
          memberSession.session,
          memberSession.requiredMemberCount - memberSession.members.length
        )
      } else if (includeFullSessions) {
        requiredSessionsWithMissingUserCount.set(memberSession.session, 0)
      }
    })
    return requiredSessionsWithMissingUserCount
  }

  get isSatisfied(): boolean {
    return this.getRequiredSessionsWithMissingUserCount().size === 0
  }

  static from(memberSessions: MemberSession[]): MemberSessionSet {
    return new MemberSessionSet(memberSessions)
  }

  getSessionsWithMissingMembers() {
    return Array.from(this.memberSessions).filter(
      (ms) => ms.requiredMemberCount > ms.members.length
    )
  }
}
