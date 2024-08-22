import { User } from "./User"

export type Notice = {
  id: number
  title: string
  content: string
  author: User
  createdDatetime: Date
  editedDatetime: Date
}