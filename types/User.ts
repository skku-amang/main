import { Generation } from "./Generation"
import { Session } from "./Session"

export type User = {
  name: string
  nickname: string
  bio: string
  profile_image: string
  generation: Generation
  sessions: Session[]
}