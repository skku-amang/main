"use client"

import { ArrowLeft, MoonStar } from "lucide-react"
import Link from "next/link"

import { useToast } from "@/components/hooks/use-toast"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import PushSettingsCard from "@/components/PushSettingsCard"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import ROUTES from "@/constants/routes"
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences
} from "@/hooks/api/useNotification"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import {
  NOTIFICATION_TYPE_LABEL,
  NotificationPreferences,
  QuietHours,
  UpdateNotificationPreferences
} from "@repo/shared-types"

type NotificationType = keyof typeof NOTIFICATION_TYPE_LABEL
const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABEL
) as NotificationType[]

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`

const HourSelect = ({
  label,
  value,
  onChange,
  disabled
}: {
  label: string
  value: number
  onChange: (hour: number) => void
  disabled: boolean
}) => (
  <Select
    value={String(value)}
    onValueChange={(v) => onChange(Number(v))}
    disabled={disabled}
  >
    <SelectTrigger className="w-24" aria-label={label}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {HOURS.map((hour) => (
        <SelectItem key={hour} value={String(hour)}>
          {hourLabel(hour)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const PreferencesForm = ({
  preferences,
  isAdmin,
  onChange,
  saving
}: {
  preferences: NotificationPreferences
  isAdmin: boolean
  onChange: (patch: UpdateNotificationPreferences) => void
  saving: boolean
}) => {
  const { mutedTypes, quietHours } = preferences
  // 가입 신청은 운영진에게만 가는 알림 — 운영진이 아니면 행 자체를 숨긴다
  const types = NOTIFICATION_TYPES.filter(
    (type) => isAdmin || type !== "USER_SIGNED_UP"
  )

  const setQuietHours = (patch: Partial<QuietHours>) =>
    onChange({ quietHours: { ...quietHours, ...patch } })

  const setTypeOn = (type: NotificationType, on: boolean) => {
    const muted = new Set(mutedTypes)
    if (on) muted.delete(type)
    else muted.add(type)
    onChange({ mutedTypes: [...muted] })
  }

  return (
    <>
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-x-3">
            <MoonStar className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">방해금지 시간</p>
              <p className="text-xs text-slate-500">
                이 시간엔 푸시를 보내지 않고 모아 뒀다가 끝나면 보내요
              </p>
            </div>
          </div>
          <Switch
            aria-label="방해금지 시간 켜기"
            checked={quietHours.enabled}
            onCheckedChange={(enabled) => setQuietHours({ enabled })}
            disabled={saving}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          <HourSelect
            label="방해금지 시작 시각"
            value={quietHours.start}
            onChange={(start) => setQuietHours({ start })}
            disabled={saving || !quietHours.enabled}
          />
          <span className="text-slate-500">부터</span>
          <HourSelect
            label="방해금지 끝 시각"
            value={quietHours.end}
            onChange={(end) => setQuietHours({ end })}
            disabled={saving || !quietHours.enabled}
          />
          <span className="text-slate-500">까지</span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {quietHours.enabled && quietHours.start === quietHours.end
            ? "시작과 끝이 같으면 꺼진 것과 같아요."
            : "자정을 넘는 구간도 돼요. 동방 예약 1시간 전 알림은 방해금지 중에도 바로 와요."}
        </p>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold">받을 푸시 종류</p>
        <p className="text-xs text-slate-500">
          꺼도 알림함에는 그대로 쌓여요. 폰으로 오는 푸시만 멈춰요.
        </p>
        <ul className="mt-3 divide-y divide-slate-100">
          {types.map((type) => {
            const id = `notification-type-${type}`
            return (
              <li
                key={type}
                className="flex items-center justify-between gap-4 py-3"
              >
                <Label htmlFor={id} className="text-sm font-normal">
                  {NOTIFICATION_TYPE_LABEL[type]}
                </Label>
                <Switch
                  id={id}
                  checked={!mutedTypes.includes(type)}
                  onCheckedChange={(on) => setTypeOn(type, on)}
                  disabled={saving}
                />
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

const PreferencesSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-36 rounded-xl" />
    <Skeleton className="h-96 rounded-xl" />
  </div>
)

const ProfileNotificationsPage = () => {
  const { toast } = useToast()
  const { user } = useCurrentUser()
  const { data: preferences, status, refetch } = useNotificationPreferences()
  const update = useUpdateNotificationPreferences()

  const onChange = (patch: UpdateNotificationPreferences) =>
    update.mutate([patch], {
      onError: () =>
        toast({
          variant: "destructive",
          title: "설정을 바꾸지 못했어요. 다시 시도해주세요."
        })
    })

  return (
    <div>
      <DefaultPageHeader
        title="알림 설정"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "내 프로필", href: ROUTES.PROFILE.INDEX },
          { display: "알림 설정" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.PROFILE.INDEX}>
            <ArrowLeft className="mr-1.5 size-4" />
            돌아가기
          </Link>
        </Button>

        <PushSettingsCard />

        {status === "pending" && <PreferencesSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
            <p className="text-slate-500">알림 설정을 불러오지 못했습니다.</p>
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
          <PreferencesForm
            preferences={preferences}
            isAdmin={user?.isAdmin ?? false}
            onChange={onChange}
            saving={update.isPending}
          />
        )}
      </div>
    </div>
  )
}

export default ProfileNotificationsPage
