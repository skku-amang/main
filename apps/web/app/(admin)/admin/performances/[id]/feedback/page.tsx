"use client"

import { FeedbackProgress } from "@repo/shared-types"
import dayjs from "dayjs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs"

import PerformanceStageBadge from "@/components/PerformanceStageBadge"
import ProfileLink from "@/components/ProfileLink"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserAvatar from "@/components/UserAvatar"
import ROUTES from "@/constants/routes"
import { useFeedbackProgress } from "@/hooks/api/useFeedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { cn } from "@/lib/utils"

type Person = FeedbackProgress["people"][number]

const VIEWS = ["people", "teams"] as const
const MISSING_PREVIEW = 3

const left = (p: Person) => p.required - p.done

const HOUR = 60 * 60 * 1000

const untilText = (ms: number) => {
  const days = Math.floor(ms / (24 * HOUR))
  const hours = Math.floor((ms % (24 * HOUR)) / HOUR)
  if (days > 0) return `${days}일 ${hours}시간`
  if (hours > 0) return `${hours}시간`
  return `${Math.max(1, Math.ceil(ms / 60000))}분`
}

/** 단계에 맞춰 피드백 시작·마감까지 남은 시간. 마감 24시간 전부터 강조 */
const feedbackDeadline = (
  stage: FeedbackProgress["stage"] | undefined,
  startAt: Date | string | null | undefined,
  endAt: Date | string | null | undefined
) => {
  if (!stage || !endAt) return null
  const end = dayjs(endAt)
  const at = (d: dayjs.Dayjs) => d.format("M월 D일 HH:mm")
  if (["PREPARING", "RECRUITING", "SUBMISSION"].includes(stage) && startAt) {
    const start = dayjs(startAt)
    return {
      text: `피드백 시작까지 ${untilText(start.diff(dayjs()))} (${at(start)})`,
      urgent: false
    }
  }
  if (stage === "EVALUATION") {
    const ms = end.diff(dayjs())
    return {
      text: `마감까지 ${untilText(ms)} (${at(end)})`,
      urgent: ms < 24 * HOUR
    }
  }
  return { text: `피드백 마감됨 (${at(end)})`, urgent: false }
}

const Bar = ({
  done,
  total,
  label,
  className
}: {
  done: number
  total: number
  label: string
  className?: string
}) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-valuenow={done}
    title={`${done} / ${total}`}
    className={cn("h-1.5 overflow-hidden rounded-full bg-slate-200", className)}
  >
    <div
      className={cn(
        "h-full rounded-full transition-all",
        done >= total ? "bg-green-600" : "bg-blue-900"
      )}
      style={{ width: `${total === 0 ? 100 : (done / total) * 100}%` }}
    />
  </div>
)

const Remaining = ({ count, unit }: { count: number; unit: string }) => (
  <span
    className={cn(
      "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
      count > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
    )}
  >
    {count > 0 ? `${count}${unit} 남음` : "✔ 다 함"}
  </span>
)

const PersonName = ({ person }: { person: Person }) => (
  <ProfileLink
    userId={person.id}
    className="flex min-w-0 items-center gap-2 hover:underline"
  >
    <UserAvatar user={person} />
    <span className="truncate">
      {person.name}{" "}
      <span className="text-muted-foreground">({person.nickname})</span>
    </span>
  </ProfileLink>
)

/** 운영진이 누가 피드백을 안 했는지 확인하는 화면 (설계 5.3). 순위·확정은 #896에서 아래에 붙는다 */
export default function PerformanceFeedbackAdminPage() {
  const performanceId = Number(useParams<{ id: string }>().id)
  const { data: performance } = usePerformance(performanceId)
  const {
    data: progress,
    isLoading,
    isError
  } = useFeedbackProgress(performanceId)
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEWS).withDefault("people")
  )
  const [incompleteOnly, setIncompleteOnly] = useQueryState(
    "incomplete",
    parseAsBoolean.withDefault(false)
  )

  const people = progress?.people ?? []
  const personById = new Map(people.map((p) => [p.id, p]))
  const teamById = new Map((progress?.teams ?? []).map((t) => [t.id, t]))
  const shown = (p: Person) => !incompleteOnly || left(p) > 0
  const doneCount = people.filter((p) => left(p) === 0).length
  const totalDone = people.reduce((sum, p) => sum + p.done, 0)
  const totalRequired = people.reduce((sum, p) => sum + p.required, 0)
  const deadline = feedbackDeadline(
    progress?.stage,
    performance?.feedbackStartAt,
    performance?.feedbackEndAt
  )
  const teamLink = (teamId: number) =>
    ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, teamId)

  // 남은 곡이 많은 사람부터. 같으면 원래 순서(팀 순서 → 팀장 → 세션)
  const sortedPeople = people
    .map((p, i) => ({ p, i }))
    .sort((a, b) => left(b.p) - left(a.p) || a.i - b.i)
    .map(({ p }) => p)
    .filter(shown)

  const teams = (progress?.teams ?? [])
    .map((team) => {
      const all = team.memberIds
        .map((id) => personById.get(id))
        .filter((p): p is Person => !!p)
      return {
        ...team,
        done: all.reduce((sum, p) => sum + p.done, 0),
        required: all.reduce((sum, p) => sum + p.required, 0),
        notDone: all.filter((p) => left(p) > 0).length,
        members: all.filter(shown)
      }
    })
    .filter((team) => team.members.length > 0)

  const empty = (
    <p className="text-sm text-muted-foreground">모두 피드백을 다 했어요.</p>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.ADMIN.PERFORMANCES} aria-label="공연 목록으로">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">피드백 현황</h1>
        {performance && (
          <>
            <span className="text-muted-foreground">{performance.name}</span>
            <PerformanceStageBadge performance={performance} />
          </>
        )}
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && (
        <p className="text-sm text-destructive">
          피드백 현황을 불러오지 못했어요.
        </p>
      )}

      {progress && (
        <>
          {progress.stage !== "EVALUATION" && (
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              {["PREPARING", "RECRUITING", "SUBMISSION"].includes(
                progress.stage
              )
                ? "아직 피드백 기간 전이에요. 지금 녹음본을 낸 팀 기준으로 해야 할 곡 수를 미리 보여줘요."
                : "피드백 기간이 끝났어요. 마지막 기록이에요."}
            </p>
          )}

          <section className="space-y-2 rounded-lg border px-4 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                전체 진행{" "}
                <span className="text-2xl font-bold tabular-nums">
                  {totalRequired === 0
                    ? 0
                    : Math.round((totalDone / totalRequired) * 100)}
                  %
                </span>
              </p>
              {deadline && (
                <p
                  className={cn(
                    "text-sm font-medium",
                    deadline.urgent ? "text-amber-700" : "text-muted-foreground"
                  )}
                >
                  {deadline.text}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              피드백 {totalDone} / {totalRequired}건 · 다 한 사람 {doneCount} /{" "}
              {people.length}명
            </p>
            <Bar
              done={totalDone}
              total={totalRequired}
              label="전체 피드백 진행"
              className="h-2.5"
            />
            <p className="text-xs text-muted-foreground">
              녹음본을 낸 팀의 소속자는 자기 팀을 뺀 모든 곡에 피드백을 남겨야
              해요. 세 점수를 다 매긴 곡만 한 것으로 셉니다.
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={view}
              onValueChange={(v) =>
                void setView(v === "teams" ? "teams" : null)
              }
            >
              <TabsList>
                <TabsTrigger value="people">사람별</TabsTrigger>
                <TabsTrigger value="teams">팀별</TabsTrigger>
              </TabsList>
            </Tabs>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={incompleteOnly}
                onChange={(e) =>
                  void setIncompleteOnly(e.target.checked || null)
                }
              />
              안 한 사람만 보기
            </label>
          </div>

          {progress.teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              녹음본을 낸 팀이 없어요.
            </p>
          ) : view === "people" ? (
            sortedPeople.length === 0 ? (
              empty
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">이름</th>
                      <th className="px-4 py-2 font-medium">소속 팀</th>
                      <th className="px-4 py-2 font-medium">진행</th>
                      <th className="px-4 py-2 font-medium">남은 곡</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedPeople.map((p) => {
                      const missing = p.missingTeamIds.map(
                        (id) => teamById.get(id)?.songName ?? ""
                      )
                      return (
                        <tr key={p.id} className="align-top">
                          <td className="max-w-56 px-4 py-2">
                            <PersonName person={p} />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex max-w-72 flex-wrap gap-1">
                              {p.teamIds.map((id) => (
                                <Link
                                  key={id}
                                  href={teamLink(id)}
                                  className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-xs hover:underline"
                                >
                                  {teamById.get(id)?.name}
                                </Link>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                              <Bar
                                done={p.done}
                                total={p.required}
                                label={`${p.name} 피드백 진행`}
                                className="w-24"
                              />
                              <Remaining count={left(p)} unit="곡" />
                            </div>
                          </td>
                          <td
                            className="px-4 py-2 text-muted-foreground"
                            title={missing.join(", ")}
                          >
                            {missing.length === 0
                              ? "-"
                              : missing.slice(0, MISSING_PREVIEW).join(", ") +
                                (missing.length > MISSING_PREVIEW
                                  ? ` 외 ${missing.length - MISSING_PREVIEW}곡`
                                  : "")}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : teams.length === 0 ? (
            empty
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {teams.map((team) => (
                <section key={team.id} className="rounded-lg border">
                  <div className="space-y-2 border-b px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={teamLink(team.id)}
                        className="min-w-0 hover:underline"
                      >
                        <p className="truncate font-medium">
                          {team.songName}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            {team.songArtist}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {team.name}
                        </p>
                      </Link>
                      <Remaining count={team.notDone} unit="명" />
                    </div>
                    <Bar
                      done={team.done}
                      total={team.required}
                      label={`${team.name} 피드백 진행`}
                    />
                  </div>
                  <ul className="divide-y">
                    {team.members.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                      >
                        <PersonName person={p} />
                        <div className="flex shrink-0 items-center gap-3">
                          <Bar
                            done={p.done}
                            total={p.required}
                            label={`${p.name} 피드백 진행`}
                            className="w-20"
                          />
                          <Remaining count={left(p)} unit="곡" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
