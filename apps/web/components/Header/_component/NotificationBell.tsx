"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import NotificationRow from "@/components/Notification/NotificationRow"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import {
  NOTIFICATIONS_QUERY_KEY,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount
} from "@/hooks/api/useNotification"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"
import { formatNotification, NotificationItem } from "@repo/shared-types"

import { HeaderMode } from ".."

const DROPDOWN_LIMIT = 10

export const UnreadBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null
  return (
    <span
      aria-label={`안 읽은 알림 ${count}개`}
      className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

const useUnreadCount = (enabled: boolean) => {
  const { data } = useUnreadNotificationCount({
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true
  })
  return data ?? 0
}

/** 모바일 헤더용: 벨 아이콘 + 뱃지, 누르면 전체 목록 페이지 */
export const NotificationBellLink = () => {
  const { user } = useAuth()
  const unread = useUnreadCount(!!user)

  if (!user) return <div className="w-6" />

  return (
    <Link
      href={ROUTES.NOTIFICATIONS}
      aria-label="알림"
      className="relative text-white"
    >
      <Bell className="size-6" />
      <UnreadBadge count={unread} />
    </Link>
  )
}

/** 데스크톱 헤더용: 벨 + 최근 알림 드롭다운 */
const NotificationBell = ({ mode }: { mode: HeaderMode }) => {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const unread = useUnreadCount(!!user)
  const { data, status } = useNotifications(DROPDOWN_LIMIT, {
    enabled: !!user && open
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  if (!user) return null

  const items = data?.pages.flatMap((page) => page.items) ?? []
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })

  const openItem = (item: NotificationItem) => {
    if (item.readAt === null)
      markRead.mutate([item.id], { onSuccess: invalidate })
    router.push(formatNotification(item).href)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label="알림"
        className={cn(
          "relative outline-none transition-colors duration-200",
          mode === "light"
            ? "text-gray-600 hover:text-primary"
            : "text-gray-300 hover:text-white"
        )}
      >
        <Bell className="size-6" />
        <UnreadBadge count={unread} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-lg p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">알림</span>
          <button
            type="button"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate([], { onSuccess: invalidate })}
            className="flex items-center gap-x-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            모두 읽음
          </button>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto">
          {status === "pending" && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              불러오는 중…
            </div>
          )}
          {status === "error" && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              알림을 불러오지 못했습니다
            </div>
          )}
          {status === "success" && items.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              아직 알림이 없습니다
            </div>
          )}
          {items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => openItem(item)}
              className="cursor-pointer rounded-none px-3 py-2.5"
            >
              <NotificationRow item={item} />
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          asChild
          className="cursor-pointer justify-center rounded-none py-2.5 text-sm"
        >
          <Link href={ROUTES.NOTIFICATIONS}>전체 보기</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell
