import { Generation } from "./Generation"
import { Session } from "./Session"

export const DepartmentNames = ["공연부", "홍보부", "기획부", "악기부"] as const
export type Department = {
  id: number
  name: keyof typeof DepartmentNames
  leader?: User
}

export const Position = ["회장", "부회장", "총무", "일반"] as const
export type Position = keyof typeof Position

export type User = {
  id: number
  email: string
  name: string
  nickname: string
  bio: string
  profileImage: string
  generation: Generation
  sessions: Session[]
  position: Position
  department: Department
  genre: string
  likedArtists: string
  createdDatetime: string
  updatedDatetime: string
}
