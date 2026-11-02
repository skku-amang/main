"use client"

import {
  FeedbackDimensionKey,
  FeedbackStatus,
  getFeedbackStatus,
  MyFeedbackSummary,
  orderFeedbackTeams,
  UpsertFeedback
} from "@repo/shared-types"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs"
import { useEffect } from "react"

import { toast } from "@/components/hooks/use-toast"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import {
  myFeedbackKey,
  useMyFeedback,
  useUpsertFeedback
} from "@/hooks/api/useFeedback"
import { usePerformance } from "@/hooks/api/usePerformance"
import { useTeams } from "@/hooks/api/useTeam"

import FeedbackRow from "./_components/FeedbackRow"

const OPEN: FeedbackStatus[] = ["NONE", "PARTIAL"]
// 펼친 곡을 직접 접었다는 표시. 값이 없으면 첫 미완료 곡을 펼친다
const COLLAPSED = 0

const applyPatch = (
  summary: MyFeedbackSummary,
  teamId: number,
  patch: UpsertFeedback
): MyFeedbackSummary => {
  const existing = summary.feedbacks.find((f) => f.teamId === teamId) ?? {
    teamId,
    teamScore: null,
    individualScore: null,
    preferenceScore: null,
    comment: null,
    updatedAt: new Date().toISOString()
  }
  const next = { ...existing, ...patch }
  return {
    ...summary,
    feedbacks: [...summary.feedbacks.filter((f) => f.teamId !== teamId), next]
  }
}

const Notice = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
    {children}
  </p>
)

const FeedbackPage = () => {
  const performanceId = Number(useParams().id)
  const queryClient = useQueryClient()
  const { data: performance } = usePerformance(performanceId)
  const { data: teams, status: teamsStatus } = useTeams(performanceId)
  const { data: mine, status: mineStatus } = useMyFeedback(performanceId)
  const { mutateAsync: upsert } = useUpsertFeedback()
  const [teamParam, setTeamParam] = useQueryState("team", parseAsInteger)
  const [remainingOnly, setRemainingOnly] = useQueryState(
    "remaining",
    parseAsBoolean.withDefault(false)
  )

  const statusOf = (teamId: number) =>
    mine ? getFeedbackStatus(teamId, mine) : "NONE"
  const targets = mine
    ? orderFeedbackTeams(
        (teams ?? []).filter((t) => mine.targetTeamIds.includes(t.id))
      )
    : []
  const reviewable = targets.filter((t) => statusOf(t.id) !== "OWN")
  const doneCount = reviewable.filter((t) => statusOf(t.id) === "DONE").length
  const firstOpen = reviewable.find((t) => OPEN.includes(statusOf(t.id)))
  const expandedId =
    teamParam === COLLAPSED ? null : (teamParam ?? firstOpen?.id ?? null)

  useEffect(() => {
    if (expandedId === null) return
    document
      .getElementById(`feedback-team-${expandedId}`)
      ?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [expandedId])

  const save = async (teamId: number, patch: UpsertFeedback) => {
    const key = myFeedbackKey(performanceId)
    queryClient.setQueryData<MyFeedbackSummary>(
      key,
      (prev) => prev && applyPatch(prev, teamId, patch)
    )
    try {
      await upsert([teamId, patch])
    } catch {
      toast({
        variant: "destructive",
        title: "저장하지 못했어요",
        description: "잠시 후 다시 눌러 주세요."
      })
      void queryClient.invalidateQueries({ queryKey: key })
    }
  }

  const header = (
    <DefaultPageHeader
      title="녹음본 피드백"
      routes={[
        { display: <DefaultHomeIcon />, href: ROUTES.HOME },
        {
          display: performance?.name ?? "공연",
          href: ROUTES.PERFORMANCE.TEAM.LIST(performanceId)
        },
        { display: "피드백", href: ROUTES.PERFORMANCE.FEEDBACK(performanceId) }
      ]}
    >
      {mine?.eligible && reviewable.length > 0 && (
        <div className="w-full max-w-md">
          <p className="text-sm text-neutral-500">
            {doneCount} / {reviewable.length} 완료
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-blue-900 transition-all"
              style={{ width: `${(doneCount / reviewable.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </DefaultPageHeader>
  )

  const body = () => {
    if (mineStatus === "pending" || teamsStatus === "pending")
      return <Notice>불러오는 중…</Notice>
    if (mineStatus === "error" || teamsStatus === "error" || !mine)
      return <Notice>피드백 정보를 불러오지 못했어요.</Notice>
    if (["PREPARING", "RECRUITING", "SUBMISSION"].includes(mine.stage))
      return (
        <Notice>
          {performance?.feedbackStartAt
            ? `피드백은 ${dayjs(performance.feedbackStartAt).format("M월 D일 HH:mm")}부터예요.`
            : "피드백 일정이 아직 없어요."}
        </Notice>
      )
    if (!mine.eligible)
      return (
        <Notice>이 공연의 피드백 대상 팀 소속자만 참여할 수 있어요.</Notice>
      )

    const readOnly = mine.stage !== "EVALUATION"
    const visible = remainingOnly
      ? targets.filter(
          (t) => OPEN.includes(statusOf(t.id)) || t.id === expandedId
        )
      : targets

    return (
      <>
        {readOnly && (
          <Notice>피드백이 끝났어요. 내가 남긴 피드백만 볼 수 있어요.</Notice>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remainingOnly}
            onChange={(e) => void setRemainingOnly(e.target.checked || null)}
          />
          남은 것만 보기
        </label>
        {visible.length === 0 ? (
          <Notice>남은 곡이 없어요. 모두 끝냈어요!</Notice>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((team) => (
              <FeedbackRow
                key={team.id}
                team={team}
                status={statusOf(team.id)}
                row={mine.feedbacks.find((f) => f.teamId === team.id)}
                expanded={team.id === expandedId}
                readOnly={readOnly}
                onToggle={() =>
                  void setTeamParam(
                    team.id === expandedId ? COLLAPSED : team.id
                  )
                }
                onScore={(key: FeedbackDimensionKey, score) =>
                  void save(team.id, { [key]: score })
                }
                onComment={(comment) => void save(team.id, { comment })}
              />
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <div>
      {header}
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-6">
        {body()}
      </div>
    </div>
  )
}

export default FeedbackPage
