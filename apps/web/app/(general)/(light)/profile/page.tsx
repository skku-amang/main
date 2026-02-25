"use client"

import { CalendarDays, Guitar, Mail, Music, Pencil, Users } from "lucide-react"
import Link from "next/link"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const ProfileSkeleton = () => (
  <div>
    <DefaultPageHeader title={<Skeleton className="mx-auto h-8 w-32" />} />
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-8 shadow-sm">
        <Skeleton className="size-24 rounded-full" />
        <div className="w-full space-y-4">
          <Skeleton className="mx-auto h-6 w-40" />
          <Skeleton className="mx-auto h-4 w-60" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      </div>
    </div>
  </div>
)

const InfoRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-slate-400">{icon}</span>
    <span className="w-16 shrink-0 text-slate-400">{label}</span>
    <span className="text-slate-700">{value}</span>
  </div>
)

const ProfilePage = () => {
  const { session, user, isLoading, isAuthenticated } = useCurrentUser()

  if (isLoading) return <ProfileSkeleton />

  if (!isAuthenticated || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-slate-500">로그인이 필요합니다.</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>로그인</Link>
        </Button>
      </div>
    )
  }

  const profileImage =
    session.user?.image ??
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(session.user?.email ?? "")}`

  return (
    <div>
      <DefaultPageHeader
        title="내 프로필"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "내 프로필" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* 프로필 카드 */}
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          {/* 상단: 아바타 + 기본 정보 */}
          <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
            <Avatar className="size-24 border-2 border-slate-100">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="text-2xl">
                {session.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">{session.user?.name}</h2>
              <p className="text-sm text-slate-400">
                @{session.user?.nickname}
              </p>

              {user?.bio && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {user.bio}
                </p>
              )}
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
            >
              <Link href={ROUTES.PROFILE.EDIT}>
                <Pencil className="mr-1.5 size-3.5" />
                편집
              </Link>
            </Button>
          </div>

          <hr className="my-6 border-slate-100" />

          {/* 상세 정보 */}
          <div className="space-y-4">
            <InfoRow
              icon={<Mail className="size-4" />}
              label="이메일"
              value={session.user?.email}
            />

            {user?.generation && (
              <InfoRow
                icon={<CalendarDays className="size-4" />}
                label="기수"
                value={`${user.generation.order / 2}기`}
              />
            )}

            {user?.sessions && user.sessions.length > 0 && (
              <InfoRow
                icon={<Guitar className="size-4" />}
                label="세션"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {user.sessions.map((s) => (
                      <SessionBadge
                        key={s.id}
                        session={getSessionDisplayName(s.name)}
                      />
                    ))}
                  </div>
                }
              />
            )}
          </div>
        </div>

        {/* 바로가기 */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link
            href={ROUTES.PERFORMANCE.LIST}
            className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Music className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">참여 공연</p>
              <p className="text-xs text-slate-400">참여한 공연 목록 보기</p>
            </div>
          </Link>

          <Link
            href={ROUTES.PROFILE.TEAMS}
            className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">참여 팀</p>
              <p className="text-xs text-slate-400">참여 중인 팀 목록 보기</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
