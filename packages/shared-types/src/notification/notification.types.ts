import type { NotificationItem } from "./notification.schema"

/** 목록 응답의 알림 1건. subjectImage는 notificationSubject 부원의 현재 프로필 사진 (없으면 null) */
export type NotificationListItem = NotificationItem & {
  subjectImage: string | null
}

export type NotificationList = {
  items: NotificationListItem[]
  /** 다음 페이지 요청에 넘길 cursor. 더 없으면 null */
  nextCursor: number | null
}

export type UnreadNotificationCount = {
  count: number
}
