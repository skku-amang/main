"use client"

import { CheckCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import NotificationRow from "@/components/Notification/NotificationRow"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount
} from "@/hooks/api/useNotification"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { formatNotification, NotificationItem } from "@repo/shared-types"

const PAGE_SIZE = 20

const NotificationsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-16 rounded-xl" />
    ))}
  </div>
)

const NotificationsPage = () => {
  const { user, isLoading: userLoading, isAuthenticated } = useCurrentUser()
  const router = useRouter()

  const { data: unread = 0 } = useUnreadNotificationCount({ enabled: !!user })
  const {
    data,
    status,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNotifications(PAGE_SIZE, { enabled: !!user })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const openItem = (item: NotificationItem) => {
    if (item.readAt === null) markRead.mutate([item.id])
    router.push(formatNotification(item).href)
  }

  if (userLoading)
    return (
      <div className="mx-auto max-w-2xl py-6">
        <NotificationsSkeleton />
      </div>
    )

  if (!isAuthenticated || !user)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-slate-500">로그인이 필요합니다.</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>로그인</Link>
        </Button>
      </div>
    )

  const items = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">알림</h1>
        <Button
          variant="ghost"
          size="sm"
          disabled={unread === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate([])}
        >
          <CheckCheck className="mr-1 size-4" />
          모두 읽음
        </Button>
      </div>

      {status === "pending" && <NotificationsSkeleton />}

      {status === "error" && (
        <div className="py-10 text-center text-slate-500">
          <p className="mb-3">알림을 불러오지 못했습니다.</p>
          <Button variant="outline" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {status === "success" && items.length === 0 && (
        <p className="py-16 text-center text-slate-500">
          아직 알림이 없습니다.
        </p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openItem(item)}
                className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <NotificationRow item={item} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "불러오는 중…" : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
