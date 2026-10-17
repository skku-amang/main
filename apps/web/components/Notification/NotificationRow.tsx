"use client"

import {
  formatNotification,
  NotificationListItem,
  notificationSubject
} from "@repo/shared-types"
import {
  Bell,
  Clock,
  LucideIcon,
  Music,
  PartyPopper,
  UserPlus,
  Users
} from "lucide-react"

import RelativeTime from "@/components/RelativeTime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** 사진을 띄울 부원이 없는 알림의 자리 아이콘 */
const TYPE_ICON: Partial<Record<NotificationListItem["type"], LucideIcon>> = {
  TEAM_MEMBER_CHANGE: Users,
  TEAM_ATTRIBUTE_CHANGE: Users,
  TEAM_CREATED: Users,
  TEAM_DELETED: Users,
  TEAM_LEADER_CHANGED: Users,
  TEAM_FILLED: Users,
  TEAM_RECRUITMENT_DEADLINE: Users,
  BOOKMARKED_TEAM_SPOT_OPENED: Users,
  PERFORMANCE_CREATED: Music,
  PERFORMANCE_UPDATED: Music,
  ROOM_RESERVATION_SOON: Clock,
  EQUIPMENT_RETURN_DUE: Clock,
  USER_SIGNED_UP: UserPlus,
  USER_APPROVED: PartyPopper
}

type NotificationRowProps = {
  item: NotificationListItem
  className?: string
}

/** 알림 1건의 본문. 드롭다운과 전체 목록 페이지가 같이 쓴다 (클릭 처리는 부모 몫) */
const NotificationRow = ({ item, className }: NotificationRowProps) => {
  const { title, body } = formatNotification(item)
  const unread = item.readAt === null
  const subject = notificationSubject(item)
  const Icon = TYPE_ICON[item.type] ?? Bell

  return (
    <div className={cn("flex w-full items-start gap-x-3", className)}>
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          unread ? "bg-primary" : "bg-transparent"
        )}
      />
      {unread && <span className="sr-only">안 읽음</span>}
      <Avatar aria-hidden className="size-9">
        {subject ? (
          <>
            <AvatarImage src={item.subjectImage ?? undefined} alt="" />
            <AvatarFallback className="text-sm">
              {subject.name[0]}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-slate-100 text-slate-500">
            <Icon className="size-4" />
          </AvatarFallback>
        )}
      </Avatar>
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
        <RelativeTime
          date={item.createdAt}
          className="mt-0.5 block text-xs text-muted-foreground"
        />
      </div>
    </div>
  )
}

export default NotificationRow
