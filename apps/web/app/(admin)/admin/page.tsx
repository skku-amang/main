"use client"

import { format } from "date-fns"
import { Guitar, Hash, Mic, Music, Users } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useGenerations } from "@/hooks/api/useGeneration"
import { usePerformances } from "@/hooks/api/usePerformance"
import { useSessions } from "@/hooks/api/useSession"
import { useAllTeams } from "@/hooks/api/useTeam"
import { useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"

// --- Summary Card ---

function SummaryCard({
  title,
  count,
  icon: Icon,
  href,
  isLoading
}: {
  title: string
  count: number
  icon: React.ElementType
  href: string
  isLoading: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border bg-white p-5 transition-all hover:bg-neutral-50 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
        <Icon className="h-5 w-5 text-neutral-600" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">{title}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <p className="text-2xl font-bold">{count}</p>
        )}
      </div>
    </Link>
  )
}

// --- Recent Activity Item ---

function ActivityItem({
  title,
  subtitle,
  date,
  href
}: {
  title: string
  subtitle: string
  date: Date | string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-neutral-500">{subtitle}</p>
      </div>
      <span className="ml-4 shrink-0 text-xs text-neutral-400">
        {format(new Date(date), "MM/dd HH:mm")}
      </span>
    </Link>
  )
}

// --- Unfilled Team Item ---

function UnfilledTeamItem({
  team
}: {
  team: {
    id: number
    songName: string
    performanceId: number
    leader: {
      id: number
      name: string
      image: string | null
      generation: { id: number; order: number }
    }
    teamSessions: {
      capacity: number
      members: { userId: number }[]
      session: { name: string }
    }[]
  }
}) {
  const totalCapacity = team.teamSessions.reduce((s, ts) => s + ts.capacity, 0)
  const totalMembers = team.teamSessions.reduce(
    (s, ts) => s + ts.members.length,
    0
  )
  const unfilledSessions = team.teamSessions
    .filter((ts) => ts.members.length < ts.capacity)
    .map((ts) => getSessionDisplayName(ts.session.name))

  return (
    <Link
      href={ROUTES.ADMIN.TEAM_DETAIL(team.id)}
      className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{team.songName}</span>
          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
            {totalMembers}/{totalCapacity}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={team.leader.image ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {team.leader.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-neutral-500">{team.leader.name}</span>
          {unfilledSessions.length > 0 && (
            <span className="text-xs text-neutral-400">
              · 미충원: {unfilledSessions.join(", ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// --- Main Dashboard ---

export default function AdminDashboardPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: generations, isLoading: generationsLoading } = useGenerations()
  const { data: performances, isLoading: performancesLoading } =
    usePerformances()
  const { data: teams, isLoading: teamsLoading } = useAllTeams()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()

  // Recent performances (latest 5 by createdAt)
  const recentPerformances = useMemo(
    () =>
      [...(performances ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [performances]
  )

  // Recent teams (latest 5 by createdAt)
  const recentTeams = useMemo(
    () =>
      [...(teams ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [teams]
  )

  // Unfilled teams (teams with members < capacity)
  const unfilledTeams = useMemo(
    () =>
      (teams ?? []).filter((team) => {
        const totalCapacity = team.teamSessions.reduce(
          (s, ts) => s + ts.capacity,
          0
        )
        const totalMembers = team.teamSessions.reduce(
          (s, ts) => s + ts.members.length,
          0
        )
        return totalCapacity > 0 && totalMembers < totalCapacity
      }),
    [teams]
  )

  // Performance name lookup
  const performanceMap = useMemo(
    () => new Map(performances?.map((p) => [p.id, p.name]) ?? []),
    [performances]
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">대시보드</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="회원"
          count={users?.length ?? 0}
          icon={Users}
          href={ROUTES.ADMIN.USERS}
          isLoading={usersLoading}
        />
        <SummaryCard
          title="기수"
          count={generations?.length ?? 0}
          icon={Hash}
          href={ROUTES.ADMIN.GENERATIONS}
          isLoading={generationsLoading}
        />
        <SummaryCard
          title="공연"
          count={performances?.length ?? 0}
          icon={Music}
          href={ROUTES.ADMIN.PERFORMANCES}
          isLoading={performancesLoading}
        />
        <SummaryCard
          title="팀"
          count={teams?.length ?? 0}
          icon={Mic}
          href={ROUTES.ADMIN.TEAMS}
          isLoading={teamsLoading}
        />
        <SummaryCard
          title="세션"
          count={sessions?.length ?? 0}
          icon={Guitar}
          href={ROUTES.ADMIN.SESSIONS}
          isLoading={sessionsLoading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Performances */}
        <div className="rounded-lg border bg-white transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">최근 공연</h2>
            <Link
              href={ROUTES.ADMIN.PERFORMANCES}
              className="text-xs text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y">
            {performancesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-3 py-2.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              ))
            ) : recentPerformances.length > 0 ? (
              recentPerformances.map((p) => (
                <ActivityItem
                  key={p.id}
                  title={p.name}
                  subtitle={
                    [
                      p.location,
                      p.startAt && format(new Date(p.startAt), "yyyy-MM-dd")
                    ]
                      .filter(Boolean)
                      .join(" · ") || "정보 없음"
                  }
                  date={p.createdAt}
                  href={`${ROUTES.ADMIN.PERFORMANCES}?rowId=${p.id}`}
                />
              ))
            ) : (
              <p className="px-3 py-6 text-center text-sm text-neutral-400">
                등록된 공연이 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Recent Teams */}
        <div className="rounded-lg border bg-white transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">최근 팀</h2>
            <Link
              href={ROUTES.ADMIN.TEAMS}
              className="text-xs text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y">
            {teamsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-3 py-2.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
              ))
            ) : recentTeams.length > 0 ? (
              recentTeams.map((t) => (
                <ActivityItem
                  key={t.id}
                  title={`${t.songName} - ${t.songArtist}`}
                  subtitle={[performanceMap.get(t.performanceId), t.leader.name]
                    .filter(Boolean)
                    .join(" · ")}
                  date={t.createdAt}
                  href={ROUTES.ADMIN.TEAM_DETAIL(t.id)}
                />
              ))
            ) : (
              <p className="px-3 py-6 text-center text-sm text-neutral-400">
                등록된 팀이 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Unfilled Teams */}
        {unfilledTeams.length > 0 && (
          <div className="rounded-lg border bg-white transition-shadow hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">
                미충원 팀{" "}
                <span className="text-sm font-normal text-neutral-400">
                  ({unfilledTeams.length})
                </span>
              </h2>
            </div>
            <div className="divide-y">
              {unfilledTeams.map((team) => (
                <UnfilledTeamItem key={team.id} team={team} />
              ))}
            </div>
          </div>
        )}

        {/* Generation Overview */}
        {!generationsLoading && generations && generations.length > 0 && (
          <div className="rounded-lg border bg-white transition-shadow hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">기수별 현황</h2>
              <Link
                href={ROUTES.ADMIN.GENERATIONS}
                className="text-xs text-blue-600 hover:underline"
              >
                전체 보기
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 p-4">
              {[...generations]
                .sort((a, b) => b.order - a.order)
                .slice(0, 10)
                .map((gen) => (
                  <Link
                    key={gen.id}
                    href={`${ROUTES.ADMIN.USERS}?generation=${gen.order}`}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-neutral-50 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <span className="font-medium">
                      {formatGenerationOrder(gen.order)}기
                    </span>
                    <span className="text-neutral-400">
                      {gen.users.length}명
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
