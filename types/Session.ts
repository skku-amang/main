/* eslint-disable no-unused-vars */
import { User } from "./User"

export enum SessionName {
  VOCAL = "보컬",
  GUITAR = "기타",
  BASS = "베이스",
  SYNTH = "신디",
  DRUM = "드럼"
}

export type Session = {
  id: number
  name: SessionName
  leader?: User // 세션장
  icon?: string
}
