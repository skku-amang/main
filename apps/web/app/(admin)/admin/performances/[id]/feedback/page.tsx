"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { parseAsBoolean, useQueryState } from "nuqs"

import PerformanceStageBadge from "@/components/PerformanceStageBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { useFeedbackProgress } from "@/hooks/api/useFeedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { cn } from "@/lib/utils"

/** 운영진이 누가 피드백을 안 했는지 확인하는 화면 (설계 5.3). 순위·확정은 #896에서 아래에 붙는다 */
export default function PerformanceFeedbackAdminPage() {
  const performanceId = Number(useParams<{ id: string }>().id)
  const { data: performance } = usePerformance(performanceId)
  const {
    data: progress,
    isLoading,
    isError
  } = useFeedbackProgress(performanceId)
  const [incompleteOnly, setIncompleteOnly] = useQueryState(
    "incomplete",
    parseAsBoolean.withDefault(false)
  )

  // 여러 팀 소속자는 팀마다 나오지만 사람 수는 한 번만 센다
  const people = new Map<number, boolean>()
  for (const team of progress?.teams ?? [])
    for (const m of team.members) people.set(m.id, m.done >= m.required)
  const doneCount = [...people.values()].filter(Boolean).length

  const teams = (progress?.teams ?? [])
    .map((team) => ({
      ...team,
      members: incompleteOnly
        ? team.members.filter((m) => m.done < m.required)
        : team.members
    }))
    .filter((team) => !incompleteOnly || team.members.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN.PERFORMANCES}>
          <Button variant="ghost" size="icon" aria-label="공연 목록으로">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
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
                ? "아직 피드백 기간 전이에요. 녹음본을 낸 팀 기준으로 해야 할 수를 미리 보여줘요."
                : "피드백 기간이 끝났어요. 마지막 기록이에요."}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              피드백을 다 한 사람{" "}
              <span className="font-semibold">
                {doneCount} / {people.size}명
              </span>
            </p>
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
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              모두 피드백을 다 했어요.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {teams.map((team) => (
                <section key={team.id} className="rounded-lg border">
                  <div className="border-b px-4 py-3">
                    <p className="font-medium">
                      {team.songName}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {team.songArtist}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{team.name}</p>
                  </div>
                  <ul className="divide-y">
                    {team.members.map((m) => {
                      const left = m.required - m.done
                      return (
                        <li
                          key={m.id}
                          className="flex items-center justify-between px-4 py-2 text-sm"
                        >
                          <span>
                            {m.name}{" "}
                            <span className="text-muted-foreground">
                              ({m.nickname})
                            </span>
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="tabular-nums text-muted-foreground">
                              {m.done} / {m.required}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                left > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-green-50 text-green-700"
                              )}
                            >
                              {left > 0 ? `${left}개 남음` : "✔ 다 함"}
                            </span>
                          </span>
                        </li>
                      )
                    })}
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
