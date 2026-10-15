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

type MemberProfileBase = { id: number; name: string; image: string | null }

/** 다른 부원 프로필. 비공개면 이름·사진만 (본인은 항상 공개 형태) */
export type MemberProfile =
  | (MemberProfileBase & { isPublic: false })
  | (MemberProfileBase & {
      isPublic: true
      nickname: string
      bio: string | null
      generation: { id: number; order: number }
      sessions: { id: number; name: SessionName }[]
      teams: MemberProfileTeam[]
    })
