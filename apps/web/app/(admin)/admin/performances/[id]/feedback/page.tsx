"use client"

import { FeedbackProgress } from "@repo/shared-types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs"

import PerformanceStageBadge from "@/components/PerformanceStageBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import { useFeedbackProgress } from "@/hooks/api/useFeedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { cn } from "@/lib/utils"

type Person = FeedbackProgress["people"][number]

const VIEWS = ["people", "teams"] as const

const left = (p: Person) => p.required - p.done

const Status = ({ person }: { person: Person }) => (
  <span className="flex shrink-0 items-center gap-3">
    <span className="tabular-nums text-muted-foreground">
      {person.done} / {person.required}
    </span>
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        left(person) > 0
          ? "bg-amber-50 text-amber-700"
          : "bg-green-50 text-green-700"
      )}
    >
      {left(person) > 0 ? `${left(person)}곡 남음` : "✔ 다 함"}
    </span>
  </span>
)

const Name = ({ person }: { person: Person }) => (
  <span>
    {person.name}{" "}
    <span className="text-muted-foreground">({person.nickname})</span>
  </span>
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

  // 남은 곡이 많은 사람부터. 같으면 원래 순서(팀 순서 → 팀장 → 세션)
  const sortedPeople = people
    .map((p, i) => ({ p, i }))
    .sort((a, b) => left(b.p) - left(a.p) || a.i - b.i)
    .map(({ p }) => p)
    .filter(shown)

  const teams = (progress?.teams ?? [])
    .map((team) => ({
      ...team,
      members: team.memberIds
        .map((id) => personById.get(id))
        .filter((p): p is Person => !!p && shown(p))
    }))
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
          <p className="text-sm text-muted-foreground">
            녹음본을 낸 팀의 소속자는 자기 팀을 뺀 모든 곡에 피드백을 남겨야
            해요. 세 점수를 다 매긴 곡만 한 것으로 셉니다.
          </p>
          {progress.stage !== "EVALUATION" && (
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              {["PREPARING", "RECRUITING", "SUBMISSION"].includes(
                progress.stage
              )
                ? "아직 피드백 기간 전이에요. 지금 녹음본을 낸 팀 기준으로 해야 할 곡 수를 미리 보여줘요."
                : "피드백 기간이 끝났어요. 마지막 기록이에요."}
            </p>
          )}

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
            <div className="flex items-center gap-4 text-sm">
              <span>
                피드백을 다 한 사람{" "}
                <span className="font-semibold">
                  {doneCount} / {people.length}명
                </span>
              </span>
              <label className="flex items-center gap-2">
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
                    {sortedPeople.map((p) => (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap px-4 py-2">
                          <Name person={p} />
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {p.teamIds
                            .map((id) => teamById.get(id)?.name)
                            .join(", ")}
                        </td>
                        <td className="px-4 py-2">
                          <Status person={p} />
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {p.missingTeamIds
                            .map((id) => teamById.get(id)?.songName)
                            .join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
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
                    {team.members.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                      >
                        <Name person={p} />
                        <Status person={p} />
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
