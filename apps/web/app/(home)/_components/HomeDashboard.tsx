"use client"

import "dayjs/locale/ko"

import dayjs from "dayjs"
import {
  Archive,
  Building2,
  CalendarClock,
  ChevronRight,
  Instagram,
  MessageSquareText,
  Music,
  Package,
  Settings,
  Star,
  Users,
  Youtube
} from "lucide-react"
import { Knewave } from "next/font/google"
import Link from "next/link"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import SOCIAL from "@/constants/social"
import { usePerformances } from "@/hooks/api/usePerformance"
import { getSessionDisplayName } from "@/constants/session"
import { useRentals } from "@/hooks/api/useRental"
import { useAllTeams } from "@/hooks/api/useTeam"
import { useTeamBookmarks } from "@/hooks/api/useTeamBookmark"
import { useAuth } from "@/lib/providers/auth-provider"
import { formatDday, getRecruitDaysLeft } from "@/lib/performance"
import { getMyTeams } from "@/lib/team/myTeams"
import { getSessionsWithMissingMembers } from "@/lib/team/teamSession"
import { cn } from "@/lib/utils"
import { isPerformanceRecruiting } from "@repo/shared-types"

const knewave = Knewave({ subsets: ["latin"], weight: ["400"] })

const PREVIEW_COUNT = 3
const UPCOMING_DAYS = 14

const Section = ({
  title,
  moreHref,
  children
}: {
  title: string
  moreHref?: string
  children: React.ReactNode
}) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex items-center text-sm text-slate-500 hover:text-primary"
        >
          전체 보기
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
    {children}
  </section>
)

const EmptyCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
    {children}
  </div>
)

// 로그인 사용자에겐 한 줄 인사만 — 홈의 핵심(모집 공연·내 팀·내 예약)이 첫 화면에 오도록
const Greeting = ({ name }: { name: string }) => (
  <p className="text-xl font-semibold md:text-2xl">{name}님, 안녕하세요 👋</p>
)

// 비로그인 방문자용 동아리 소개 + 로그인 입구
const Hero = () => (
  <div
    className="relative overflow-hidden rounded-2xl bg-cover bg-center px-6 py-10 text-white md:px-10 md:py-16"
    style={{ backgroundImage: `url('/Music band_pixabay 1.png')` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
    <div className="relative space-y-2">
      <p className={cn(knewave.className, "text-4xl md:text-6xl")}>Amang</p>
      <p className="text-sm text-white/80 md:text-base">
        성균관대학교 밴드 동아리
      </p>
      <Button
        asChild
        className="mt-3 bg-white font-semibold text-primary hover:bg-white/90"
      >
        <Link href={ROUTES.LOGIN}>로그인하고 시작하기</Link>
      </Button>
    </div>
  </div>
)

const RecruitingPerformance = () => {
  const { data: performances, status } = usePerformances()

  if (status === "pending") return <Skeleton className="h-20 rounded-xl" />
  if (!performances?.length) return null

  // /performances/latest/teams와 같은 기준: 가장 최근에 만든 공연
  const latest = performances.reduce((a, b) => (a.id > b.id ? a : b))
  if (!isPerformanceRecruiting(latest)) return null
  const deadline = latest.recruitEndAt ? dayjs(latest.recruitEndAt) : null
  const daysLeft = getRecruitDaysLeft(latest)

  return (
    <Link
      href={ROUTES.PERFORMANCE.TEAM.LIST(latest.id)}
      className="flex items-center gap-4 rounded-xl bg-primary p-5 text-white shadow-sm transition-opacity hover:opacity-90"
    >
      <Music className="size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/70">팀 모집 중</p>
        <p className="truncate text-lg font-semibold">{latest.name}</p>
        {deadline && (
          <p className="text-xs text-white/70">
            {deadline.locale("ko").format("YYYY.MM.DD (ddd)")} 마감
          </p>
        )}
      </div>
      {daysLeft !== undefined && daysLeft >= 0 && (
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-sm font-semibold">
          {formatDday(daysLeft)}
        </span>
      )}
      <ChevronRight className="size-5 shrink-0" />
    </Link>
  )
}

const MyTeams = ({ userId }: { userId: number }) => {
  const { data: teams, status } = useAllTeams()

  const myTeams = getMyTeams(teams, userId)

  return (
    <Section title="내 팀" moreHref={ROUTES.PROFILE.TEAMS}>
      {status === "pending" ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : status === "error" ? (
        <EmptyCard>
          팀 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </EmptyCard>
      ) : myTeams.length === 0 ? (
        <EmptyCard>참여 중인 팀이 없어요.</EmptyCard>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
          {myTeams.slice(0, PREVIEW_COUNT).map((team) => (
            <li key={team.id}>
              <Link
                href={ROUTES.PERFORMANCE.TEAM.DETAIL(
                  team.performanceId,
                  team.id
                )}
                className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{team.songName}</p>
                  <p className="truncate text-sm text-slate-500">
                    {team.songArtist}
                  </p>
                </div>
                {team.leader.id === userId && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    팀장
                  </span>
                )}
                <ChevronRight className="size-4 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

// 지금 모집 중인 공연(가장 최근 공연)에서 별표한 팀만
const BookmarkedTeams = () => {
  const { data: performances } = usePerformances()
  const { data: teams, status } = useAllTeams()
  const bookmarks = useTeamBookmarks()

  const latest = performances?.length
    ? performances.reduce((a, b) => (a.id > b.id ? a : b))
    : undefined
  if (!latest || !isPerformanceRecruiting(latest)) return null

  const bookmarkedTeams =
    teams?.filter(
      (team) => team.performanceId === latest.id && bookmarks.has(team.id)
    ) ?? []

  return (
    <Section
      title="별표한 팀"
      moreHref={`${ROUTES.PERFORMANCE.TEAM.LIST(latest.id)}?bookmarked=true`}
    >
      {status === "pending" ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : status === "error" ? (
        <EmptyCard>
          팀 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </EmptyCard>
      ) : bookmarkedTeams.length === 0 ? (
        <EmptyCard>팀 목록에서 ☆를 눌러 관심 있는 팀을 모아보세요.</EmptyCard>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
          {bookmarkedTeams.slice(0, PREVIEW_COUNT).map((team) => {
            const missing = getSessionsWithMissingMembers(team.teamSessions)
            return (
              <li key={team.id}>
                <Link
                  href={ROUTES.PERFORMANCE.TEAM.DETAIL(
                    team.performanceId,
                    team.id
                  )}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
                >
                  <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{team.songName}</p>
                    <p className="truncate text-sm text-slate-500">
                      {missing.length > 0
                        ? `모집: ${missing
                            .map((ts) => getSessionDisplayName(ts.session.name))
                            .join(", ")}`
                        : "모집 완료"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-300" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

const MyUpcomingRentals = ({ userId }: { userId: number }) => {
  // 쿼리 키가 렌더마다 바뀌지 않도록 마운트 시점에 한 번만 계산
  const [range] = useState(() => ({
    type: "room" as const,
    from: dayjs().startOf("day").toDate(),
    to: dayjs().add(UPCOMING_DAYS, "day").endOf("day").toDate()
  }))
  const { data: rentals, status } = useRentals(range)

  const now = dayjs()
  const myRentals =
    rentals
      ?.filter(
        (r) =>
          r.users.some((u) => u.id === userId) && dayjs(r.endAt).isAfter(now)
      )
      .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf())
      .slice(0, PREVIEW_COUNT) ?? []

  return (
    <Section title="내 동방 예약" moreHref={ROUTES.RESERVATION.CLUBROOM}>
      {status === "pending" ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : status === "error" ? (
        <EmptyCard>
          예약을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </EmptyCard>
      ) : myRentals.length === 0 ? (
        <EmptyCard>앞으로 {UPCOMING_DAYS}일 동안 예약이 없어요.</EmptyCard>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
          {myRentals.map((rental) => {
            const start = dayjs(rental.startAt).locale("ko")
            const end = dayjs(rental.endAt).locale("ko")
            // 하루를 넘기는 예약은 끝나는 날짜도 표시
            const endLabel = end.isSame(start, "day")
              ? end.format("HH:mm")
              : end.format("M/D (ddd) HH:mm")
            return (
              <li key={rental.id}>
                <Link
                  href={ROUTES.RESERVATION.CLUBROOM}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
                >
                  {rental.renter ? (
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={rental.renter.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {rental.renter.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <CalendarClock className="size-5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{rental.title}</p>
                    <p className="text-sm text-slate-500">
                      동방 · {start.format("M/D (ddd) HH:mm")}~{endLabel}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-300" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

const SuggestionBanner = () => (
  <Link
    href={ROUTES.SUGGESTIONS}
    className="flex items-center gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
  >
    <MessageSquareText className="size-7 shrink-0 text-primary" />
    <div className="min-w-0 flex-1">
      <p className="font-semibold">불편한 점이나 바라는 점이 있나요?</p>
      <p className="text-sm text-slate-600">
        개발자에게 바로 의견을 보내주세요.
      </p>
    </div>
    <ChevronRight className="size-5 shrink-0 text-primary" />
  </Link>
)

type Shortcut = {
  label: string
  href: string
  icon: React.ElementType
  external?: boolean
}

const Shortcuts = ({ isAdmin }: { isAdmin: boolean }) => {
  const shortcuts: Shortcut[] = [
    {
      label: "팀 모집",
      href: ROUTES.PERFORMANCE.TEAM.LATEST_LIST,
      icon: Users
    },
    {
      label: "동방 예약",
      href: ROUTES.RESERVATION.CLUBROOM,
      icon: Building2
    },
    { label: "장비 대여", href: ROUTES.RESERVATION.EQUIPMENT, icon: Package },
    { label: "아카이브", href: ROUTES.PERFORMANCE.LIST, icon: Archive },
    {
      label: "YouTube",
      href: SOCIAL.Youtube.url,
      icon: Youtube,
      external: true
    },
    {
      label: "Instagram",
      href: SOCIAL.Instagram.url,
      icon: Instagram,
      external: true
    },
    ...(isAdmin
      ? [{ label: "관리자", href: ROUTES.ADMIN.INDEX, icon: Settings }]
      : [])
  ]

  return (
    <Section title="바로가기">
      <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {shortcuts.map(({ label, href, icon: Icon, external }) => (
          <li key={label}>
            <Link
              href={href}
              {...(external && {
                target: "_blank",
                rel: "noopener noreferrer"
              })}
              className="flex flex-col items-center gap-2 rounded-xl bg-white py-4 text-sm text-slate-600 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="size-6 text-primary" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

const HomeDashboard = () => {
  const { user, isLoading } = useAuth()

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6 md:py-12">
      {!isLoading && (user ? <Greeting name={user.name} /> : <Hero />)}
      {user && <MyUpcomingRentals userId={user.id} />}
      <RecruitingPerformance />
      {user && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <MyTeams userId={user.id} />
          <BookmarkedTeams />
        </div>
      )}
      <SuggestionBanner />
      <Shortcuts isAdmin={!!user?.isAdmin} />
    </div>
  )
}

export default HomeDashboard
