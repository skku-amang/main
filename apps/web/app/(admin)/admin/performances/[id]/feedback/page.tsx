"use client"

import { FeedbackProgress } from "@repo/shared-types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs"
import { useMemo } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { UserCell } from "@/app/(admin)/_components/data-table/UserCell"
import PerformanceStageBadge from "@/components/PerformanceStageBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import { useFeedbackProgress } from "@/hooks/api/useFeedback"
import { feedbackDeadline } from "@/lib/feedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { cn } from "@/lib/utils"

import { getPeopleColumns, remainingOf } from "./_components/peopleColumns"
import { ProgressBar, RemainingBadge } from "./_components/ProgressBits"

type Person = FeedbackProgress["people"][number]

const VIEWS = ["people", "teams"] as const

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
  const shown = (p: Person) => !incompleteOnly || remainingOf(p) > 0
  const doneCount = people.filter((p) => remainingOf(p) === 0).length
  const totalDone = people.reduce((sum, p) => sum + p.done, 0)
  const totalRequired = people.reduce((sum, p) => sum + p.required, 0)
  const deadline = feedbackDeadline(
    progress?.stage,
    performance?.feedbackStartAt,
    performance?.feedbackEndAt
  )
  const teamLink = (teamId: number) =>
    ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, teamId)

  const peopleColumns = useMemo(
    () =>
      getPeopleColumns(
        new Map((progress?.teams ?? []).map((t) => [t.id, t])),
        (teamId) => ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, teamId)
      ),
    [progress?.teams, performanceId]
  )

  const teams = (progress?.teams ?? [])
    .map((team) => {
      const all = team.memberIds
        .map((id) => personById.get(id))
        .filter((p): p is Person => !!p)
      return {
        ...team,
        done: all.reduce((sum, p) => sum + p.done, 0),
        required: all.reduce((sum, p) => sum + p.required, 0),
        notDone: all.filter((p) => remainingOf(p) > 0).length,
        members: all.filter(shown)
      }
    })
    .filter((team) => team.members.length > 0)

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
            <ProgressBar
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
            <DataTable
              columns={peopleColumns}
              data={people.filter(shown)}
              searchColumn="name"
              searchPlaceholder="이름 검색"
              initialSorting={[{ id: "progress", desc: true }]}
              emptyMessage="모두 피드백을 다 했어요."
            />
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              모두 피드백을 다 했어요.
            </p>
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
                      <RemainingBadge count={team.notDone} unit="명" />
                    </div>
                    <ProgressBar
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
                        <UserCell user={p} />
                        <div className="flex shrink-0 items-center gap-3">
                          <ProgressBar
                            done={p.done}
                            total={p.required}
                            label={`${p.name} 피드백 진행`}
                            className="w-20"
                          />
                          <RemainingBadge count={remainingOf(p)} unit="곡" />
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
