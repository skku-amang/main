"use client"

import { CalendarDays, Guitar, Lock, Pencil } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useMemberProfile } from "@/hooks/api/useUser"
import { useAuth } from "@/lib/providers/auth-provider"
import { formatGenerationOrder } from "@repo/shared-types"

const MemberProfilePage = () => {
  const userId = Number(useParams().id)
  const { user: viewer } = useAuth()
  const { data: profile, status } = useMemberProfile(userId)

  if (status === "pending") {
    return (
      <div className="mx-auto max-w-2xl pt-24">
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (status === "error" || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-slate-500">부원을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const isMe = viewer?.id === profile.id

  return (
    <div>
      <DefaultPageHeader
        title={profile.name}
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "부원 프로필" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
            <Avatar className="size-24 border-2 border-slate-100">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback className="text-2xl">
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-sm text-slate-400">@{profile.nickname}</p>
              {profile.isPublic && profile.bio && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {profile.bio}
                </p>
              )}
            </div>

            {isMe && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full"
              >
                <Link href={ROUTES.PROFILE.EDIT}>
                  <Pencil className="mr-1.5 size-3.5" />
                  공개 설정
                </Link>
              </Button>
            )}
          </div>

          <hr className="my-6 border-slate-100" />
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 text-slate-400" />
              <span className="w-16 shrink-0 text-slate-400">기수</span>
              <span>{formatGenerationOrder(profile.generation.order)}기</span>
            </div>
            {profile.sessions.length > 0 && (
              <div className="flex items-center gap-3">
                <Guitar className="size-4 text-slate-400" />
                <span className="w-16 shrink-0 text-slate-400">세션</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.sessions.map((s) => (
                    <SessionBadge
                      key={s.id}
                      session={getSessionDisplayName(s.name)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {!profile.isPublic && (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm text-slate-500 shadow-sm">
            <Lock className="size-4" />
            소개와 참여한 팀은 비공개예요.
          </p>
        )}

        {profile.isPublic && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">참여한 팀</h3>
            {profile.teams.length === 0 ? (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                참여한 팀이 없어요.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm">
                {profile.teams.map((team) => (
                  <li key={team.id}>
                    <Link
                      href={ROUTES.PERFORMANCE.TEAM.DETAIL(
                        team.performance.id,
                        team.id
                      )}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-slate-400">
                          {team.performance.name}
                        </p>
                        <p className="truncate font-medium">
                          {team.songName}
                          <span className="ml-1.5 text-sm font-normal text-slate-500">
                            {team.songArtist}
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        {team.isLeader && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            팀장
                          </span>
                        )}
                        {team.sessions.map((s) => (
                          <SessionBadge
                            key={s}
                            session={getSessionDisplayName(s)}
                          />
                        ))}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default MemberProfilePage
