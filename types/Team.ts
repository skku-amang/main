import { User } from "./User"
import { Performance } from "./Performance"
import { Session } from "./Session"

export type Team = {
  name: string
  description: string
  is_private: boolean
  leader: User
  performance: Performance
  song: Song
}

export type Song = {
  name: string
  artist: string
  cover_name?: string
  cover_artist?: string
  original_url: string
  cover_url?: string
  satisfied_sessions: Session[]   // 이거 Map<Session, User>으로 해야 하는거 아님?
  unsatisfied_sessions: Session[]
}