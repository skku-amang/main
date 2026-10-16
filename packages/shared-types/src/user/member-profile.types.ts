import type { SessionName } from "@repo/database/enums"

export type MemberProfileTeam = {
  id: number
  songName: string
  songArtist: string
  performance: { id: number; name: string; startAt: Date | null }
  isLeader: boolean
  /** 팀원으로 맡은 세션 (팀장만 맡았으면 빈 배열) */
  sessions: SessionName[]
}

// 부원 목록(publicUserSelector)에서 이미 보이는 정보라 공개 설정과 무관하게 항상 보여준다
type MemberProfileBase = {
  id: number
  name: string
  image: string | null
  nickname: string
  generation: { id: number; order: number }
  sessions: { id: number; name: SessionName }[]
}

/** 다른 부원 프로필. 비공개면 소개·참여한 팀을 숨긴다 (본인은 항상 공개 형태) */
export type MemberProfile =
  | (MemberProfileBase & { isPublic: false })
  | (MemberProfileBase & {
      isPublic: true
      bio: string | null
      teams: MemberProfileTeam[]
    })
