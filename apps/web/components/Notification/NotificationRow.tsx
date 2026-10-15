"use client"

import { formatNotification, NotificationItem } from "@repo/shared-types"

import { cn, getRepresentativeRelativeTime } from "@/lib/utils"

type NotificationRowProps = {
  item: NotificationItem
  className?: string
}

/** 알림 1건의 본문. 드롭다운과 전체 목록 페이지가 같이 쓴다 (클릭 처리는 부모 몫) */
const NotificationRow = ({ item, className }: NotificationRowProps) => {
  const { title, body } = formatNotification(item)
  const unread = item.readAt === null

  return (
    <div className={cn("flex w-full items-start gap-x-3", className)}>
      <span
        aria-label={unread ? "안 읽음" : undefined}
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          unread ? "bg-primary" : "bg-transparent"
        )}
      />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-sm",
            unread ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {title}
        </div>
        <div className="line-clamp-2 text-sm text-foreground/90">{body}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {getRepresentativeRelativeTime(item.createdAt)}
        </div>
      </div>
    </div>
  )
}

export default NotificationRow
