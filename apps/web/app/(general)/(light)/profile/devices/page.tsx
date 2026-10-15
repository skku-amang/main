"use client"

import { useQueryClient } from "@tanstack/react-query"
import Bowser from "bowser"
import dayjs from "dayjs"
import "dayjs/locale/ko"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowLeft, Monitor, Smartphone } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

import { useToast } from "@/components/hooks/use-toast"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import PushSettingsCard from "@/components/PushSettingsCard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import {
  AUTH_SESSIONS_QUERY_KEY,
  useAuthSessions,
  useLogoutAuthSession,
  useLogoutOtherAuthSessions
} from "@/hooks/api/useAuth"
import { useAuth } from "@/lib/providers/auth-provider"
import { AuthSessionInfo } from "@repo/shared-types"

dayjs.extend(relativeTime)

const REMOTE_LOGOUT_NOTICE = "최대 1시간 안에 그 기기의 접속이 끊깁니다."

const describeDevice = (userAgent: string) => {
  const parser = Bowser.getParser(userAgent || " ")
  const os = parser.getOSName()
  const browser = parser.getBrowserName()
  const platform = parser.getPlatformType()
  return {
    name:
      os || browser
        ? [os, browser].filter(Boolean).join(" · ")
        : "알 수 없는 기기",
    isMobile: platform === "mobile" || platform === "tablet"
  }
}

const ConfirmButton = ({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm
}: {
  trigger: ReactNode
  title: string
  description?: string
  confirmLabel: string
  onConfirm: () => void
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        )}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>취소</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

const DeviceRow = ({
  session,
  onLogout
}: {
  session: AuthSessionInfo
  onLogout: () => void
}) => {
  const device = describeDevice(session.userAgent)
  const Icon = device.isMobile ? Smartphone : Monitor

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{device.name}</p>
          {session.current && <Badge variant="secondary">현재 기기</Badge>}
        </div>
        <p className="text-xs text-slate-400">
          처음 로그인 {dayjs(session.createdAt).format("M월 D일")} · 마지막 사용{" "}
          {dayjs(session.lastUsedAt).locale("ko").fromNow()}
        </p>
      </div>
      <ConfirmButton
        trigger={
          <Button variant="outline" size="sm" className="shrink-0 rounded-full">
            로그아웃
          </Button>
        }
        title={
          session.current
            ? "이 기기에서 로그아웃할까요?"
            : "이 기기를 로그아웃할까요?"
        }
        description={session.current ? undefined : REMOTE_LOGOUT_NOTICE}
        confirmLabel="로그아웃"
        onConfirm={onLogout}
      />
    </div>
  )
}

const DevicesSkeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((i) => (
      <Skeleton key={i} className="h-20 rounded-xl" />
    ))}
  </div>
)

const ProfileDevicesPage = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { logout } = useAuth()
  const { data: sessions, status, refetch } = useAuthSessions()
  const logoutSession = useLogoutAuthSession()
  const logoutOthers = useLogoutOtherAuthSessions()

  const otherCount = sessions?.filter((s) => !s.current).length ?? 0

  const afterRemoteLogout = (succeeded: boolean) => {
    if (succeeded) {
      toast({ title: "로그아웃했습니다." })
      queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY })
    } else {
      toast({
        variant: "destructive",
        title: "로그아웃에 실패했습니다. 다시 시도해주세요."
      })
    }
  }

  const onLogout = (session: AuthSessionInfo) => {
    if (session.current) {
      logout().then(() => (window.location.href = "/"))
      return
    }
    logoutSession.mutate([session.sid], {
      onSuccess: () => afterRemoteLogout(true),
      onError: () => afterRemoteLogout(false)
    })
  }

  const onLogoutOthers = () =>
    logoutOthers.mutate([], {
      onSuccess: () => afterRemoteLogout(true),
      onError: () => afterRemoteLogout(false)
    })

  return (
    <div>
      <DefaultPageHeader
        title="로그인 기기"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "내 프로필", href: ROUTES.PROFILE.INDEX },
          { display: "로그인 기기" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.PROFILE.INDEX}>
              <ArrowLeft className="mr-1.5 size-4" />
              돌아가기
            </Link>
          </Button>
          {otherCount > 0 && (
            <ConfirmButton
              trigger={
                <Button variant="outline" size="sm" className="rounded-full">
                  다른 기기 모두 로그아웃
                </Button>
              }
              title={`현재 기기를 제외한 ${otherCount}개 기기를 로그아웃할까요?`}
              description={REMOTE_LOGOUT_NOTICE}
              confirmLabel="모두 로그아웃"
              onConfirm={onLogoutOthers}
            />
          )}
        </div>

        <PushSettingsCard />

        {status === "pending" && <DevicesSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
            <p className="text-slate-500">기기 목록을 불러오지 못했습니다.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <DeviceRow
                key={session.sid}
                session={session}
                onLogout={() => onLogout(session)}
              />
            ))}
            {otherCount === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                다른 기기에서 로그인한 기록이 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileDevicesPage
