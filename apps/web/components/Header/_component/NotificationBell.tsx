"use client"

import { Bell, CheckCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

/** 뱃지는 장식. 개수는 벨의 접근 가능한 이름(bellLabel)이 전달한다 */
export const UnreadBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null
  return (
    <span
      aria-hidden
      className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

const bellLabel = (unread: number) =>
  unread > 0 ? `알림, 안 읽은 알림 ${unread}개` : "알림"

const useUnreadCount = (enabled: boolean) => {
  const { data } = useUnreadNotificationCount({
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true
  })
  const count = data ?? 0
  // 읽음 처리하면 앱 아이콘 숫자 배지도 맞춰 줄인다 (푸시 수신 시 증가는 sw.js)
  useEffect(() => {
    if ("setAppBadge" in navigator) navigator.setAppBadge(count).catch(() => {})
  }, [count])
  return count
}

/** 모바일 헤더용: 벨 아이콘 + 뱃지, 누르면 전체 목록 페이지 */
export const NotificationBellLink = () => {
  const { user } = useAuth()
  const unread = useUnreadCount(!!user)

  if (!user) return <div className="w-6" />

  return (
    <Link
      href={ROUTES.NOTIFICATIONS}
      aria-label={bellLabel(unread)}
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
  const [open, setOpen] = useState(false)

  const unread = useUnreadCount(!!user)
  // 열 때마다 새로 가져온다 — 닫혀 있는 동안 쌓인 알림이 뱃지 수와 어긋나지 않게
  const { data, status } = useNotifications(DROPDOWN_LIMIT, {
    enabled: !!user && open,
    staleTime: 0
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  if (!user) return null

  const items = data?.pages.flatMap((page) => page.items) ?? []

  const openItem = (item: NotificationItem) => {
    if (item.readAt === null) markRead.mutate([item.id])
    router.push(formatNotification(item).href)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={bellLabel(unread)}
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
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-sm font-semibold">알림</span>
          {/* 메뉴 항목이어야 방향키·Enter로 닿는다. preventDefault로 메뉴는 열린 채 유지 */}
          <DropdownMenuItem
            disabled={unread === 0 || markAllRead.isPending}
            onSelect={(e) => {
              e.preventDefault()
              markAllRead.mutate([])
            }}
            className="flex cursor-pointer items-center gap-x-1 px-2 py-1 text-xs text-muted-foreground focus:text-foreground"
          >
            <CheckCheck className="size-3.5" />
            모두 읽음
          </DropdownMenuItem>
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
