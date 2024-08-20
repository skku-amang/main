import { User } from "./User"

export enum SessionName {
  VOCAL = "보컬",
  GUITAR = "기타",
  BASS = "베이스",
  SYNTH = "신디",
  DRUM = "드럼"
}

export type Session = {
  name: SessionName
  leader?: User
}