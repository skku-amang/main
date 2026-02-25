"use client"

import { ArrowLeft, Music } from "lucide-react"
import Link from "next/link"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import StatusBadge from "@/components/TeamBadges/StatusBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useAllTeams } from "@/hooks/api/useTeam"
import { usePerformances } from "@/hooks/api/usePerformance"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { isTeamSatisfied } from "@/lib/team/teamSession"

const TeamsSkeleton = () => (
  <div>
    <DefaultPageHeader title={<Skeleton className="mx-auto h-8 w-40" />} />
    <div className="mx-auto max-w-2xl space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  </div>
)

const ProfileTeamsPage = () => {
  const { session, isLoading: userLoading, isAuthenticated } = useCurrentUser()
  const { data: allTeams, status: teamsStatus } = useAllTeams()
  const { data: performances } = usePerformances()

  const isLoading = userLoading || teamsStatus === "pending"
  const userId = session?.user?.id ? Number(session.user.id) : null

  if (isLoading) return <TeamsSkeleton />

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

  // 내가 참여 중인 팀 필터링 (리더이거나 멤버인 팀)
  const myTeams =
    allTeams?.filter((team) => {
      if (team.leader.id === userId) return true
      return team.teamSessions.some((ts) =>
        ts.members.some((m) => m.user.id === userId)
      )
    }) ?? []

  // 공연 ID → 이름 매핑
  const performanceMap = new Map(performances?.map((p) => [p.id, p.name]) ?? [])

  return (
    <div>
      <DefaultPageHeader
        title="참여 팀"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "내 프로필", href: ROUTES.PROFILE.INDEX },
          { display: "참여 팀" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.PROFILE.INDEX}>
            <ArrowLeft className="mr-1.5 size-4" />
            돌아가기
          </Link>
        </Button>

        {myTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
            <Music className="mb-3 size-10 text-slate-300" />
            <p className="text-slate-500">참여 중인 팀이 없습니다.</p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href={ROUTES.PERFORMANCE.LIST}>공연 둘러보기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myTeams.map((team) => {
              const performanceName =
                performanceMap.get(team.performanceId) ?? "공연"
              const status = isTeamSatisfied(team.teamSessions)
                ? "Inactive"
                : "Active"

              // 내 세션 찾기
              const mySession = team.teamSessions.find((ts) =>
                ts.members.some((m) => m.user.id === userId)
              )

              return (
                <Link
                  key={team.id}
                  href={ROUTES.PERFORMANCE.TEAM.DETAIL(
                    team.performanceId,
                    team.id
                  )}
                  className="block rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      {/* 곡명 + 상태 */}
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-medium">
                          {team.songName}
                        </h3>
                        <StatusBadge status={status} size="small" />
                      </div>

                      {/* 아티스트 */}
                      <p className="mt-0.5 text-sm text-slate-400">
                        {team.songArtist}
                      </p>

                      {/* 공연명 + 내 세션 */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5">
                          {performanceName}
                        </span>
                        {team.leader.id === userId && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
                            팀장
                          </span>
                        )}
                        {mySession && (
                          <SessionBadge
                            session={getSessionDisplayName(
                              mySession.session.name
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileTeamsPage
