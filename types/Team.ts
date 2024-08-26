import { Performance } from "./Performance"
import { Session } from "./Session"
import { User } from "./User"

export type Team = {
  id: number
  name?: string
  description: string
  is_private: boolean
  leader: User
  performance: Performance
  song: Song
  is_freshmanFixed: boolean
  posterImage?: string
  youtubeVideo?: string     // 아망 공식 홈페이지 유튜브 영상
  memberSessions: MemberSession[]
}

export type Song = {
  name: string
  artist: string
  cover_name?: string
  cover_artist?: string
  original_url: string
  cover_url?: string
}

/**
 * 팀의 세션별 멤버 정보   
 * @param requiredMemberCount 세션별 필요한 멤버 수   
 * 만약 `members`의 길이가 2이고 `requiredMemberCount`가 3이면
 * 해당 세션에 멤버가 2명이 있지만 아직 세션에 멤버가 1명이 부족한 상황
 */
export type MemberSession = {
  session: Session
  members: User[]
  requiredMemberCount: number
}