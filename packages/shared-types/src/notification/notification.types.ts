import type { NotificationItem } from "./notification.schema"

export type NotificationList = {
  items: NotificationItem[]
  /** 다음 페이지 요청에 넘길 cursor. 더 없으면 null */
  nextCursor: number | null
}

export type UnreadNotificationCount = {
  count: number
}
