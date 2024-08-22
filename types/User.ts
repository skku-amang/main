import { Generation } from "./Generation"
import { Session } from "./Session"

export type User = {
  id: number
  name: string
  nickname: string
  email: string
  bio: string
  profile_image: string
  generation: Generation
  sessions: Session[]
}