import { User } from "./User"

export type Generation = {
  id: number
  order: number
  createdAt: Date
  updatedAt: Date

  leader?: User
  leaderId?: number

  users: User[]
}
