import { User } from "./User"
import { Performance } from "./Performance"
import { Session } from "./Session"

export type Team = {
  id: number
  name: string
  description: string
  is_private: boolean
  leader: User
  performance: Performance
  song: Song
  is_freshmanFixed: boolean
  posterImage?: string
  youtubeVideo?: string     // 아망 공식 홈페이지 유튜브 영상
}

export type Song = {
  name: string
  artist: string
  cover_name?: string
  cover_artist?: string
  original_url: string
  cover_url?: string
  satisfied_sessions: Session[]
  unsatisfied_sessions: Session[]
}