"use client"

import {
  FeedbackDimensionKey,
  FeedbackStatus,
  getFeedbackStatus,
  MyFeedbackSummary,
  nextFeedbackTeamId,
  orderFeedbackTeams,
  UpsertFeedback
} from "@repo/shared-types"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import Link from "next/link"
import { useParams } from "next/navigation"
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs"
import { useEffect, useRef, useState } from "react"

import { toast } from "@/components/hooks/use-toast"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { Switch } from "@/components/ui/switch"
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
  const [autoPlayNext, setAutoPlayNext] = useQueryState(
    "autoplay",
    parseAsBoolean.withDefault(false)
  )
  // 다음 곡 버튼으로 넘어간 곡만 재생한다. 줄을 직접 눌러 펼칠 때는 재생하지 않는다
  const [autoPlayTeamId, setAutoPlayTeamId] = useState<number | null>(null)

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
  // 주소에 본인 팀·대상 아닌 팀이 와도 펼치지 않는다 (저장하면 거부됨)
  const expandedId = reviewable.some((t) => t.id === teamParam)
    ? teamParam
    : null

  // 처음 들어왔을 때 한 번만 첫 미완료 곡을 펼친다. 매 렌더 다시 고르면
  // 마지막 점수를 누르는 순간 다음 곡으로 넘어가 버린다 (설계: 자동으로 넘어가지 않음)
  const initialPicked = useRef(false)
  useEffect(() => {
    if (initialPicked.current || !mine || !teams) return
    initialPicked.current = true
    if (teamParam === null && firstOpen)
      void setTeamParam(firstOpen.id, { history: "replace" })
  }, [mine, teams, teamParam, firstOpen, setTeamParam])

  useEffect(() => {
    if (expandedId === null) return
    document
      .getElementById(`feedback-team-${expandedId}`)
      ?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [expandedId])

  // 마감 시각이 지나면 단계를 다시 받아 입력을 막는다 (열어 둔 채 마감을 넘기는 경우)
  const feedbackEndAt = performance?.feedbackEndAt
  useEffect(() => {
    if (!feedbackEndAt || mine?.stage !== "EVALUATION") return
    const ms = new Date(feedbackEndAt).getTime() - Date.now() + 1000
    if (ms > 2 ** 31 - 1) return
    const timer = setTimeout(
      () =>
        void queryClient.invalidateQueries({
          queryKey: myFeedbackKey(performanceId)
        }),
      Math.max(ms, 0)
    )
    return () => clearTimeout(timer)
  }, [feedbackEndAt, mine?.stage, performanceId, queryClient])

  // 같은 팀 저장은 한 줄로 세운다 (연타 시 서버 도착 순서 = 누른 순서).
  // 저장이 하나도 안 남으면 서버 값으로 다시 맞춘다 — 화면만 바뀐 값이 남지 않게
  const queues = useRef(new Map<number, Promise<unknown>>())
  const pending = useRef(0)
  const save = async (teamId: number, patch: UpsertFeedback) => {
    const key = myFeedbackKey(performanceId)
    await queryClient.cancelQueries({ queryKey: key })
    queryClient.setQueryData<MyFeedbackSummary>(
      key,
      (prev) => prev && applyPatch(prev, teamId, patch)
    )
    pending.current += 1
    const run = (queues.current.get(teamId) ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => upsert([teamId, patch]))
    queues.current.set(teamId, run)
    try {
      await run
      return true
    } catch {
      toast({
        variant: "destructive",
        title: "저장하지 못했어요",
        description: "잠시 후 다시 눌러 주세요."
      })
      return false
    } finally {
      pending.current -= 1
      if (pending.current === 0)
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
        <div className="w-full">
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
    const finished =
      !readOnly && reviewable.length > 0 && doneCount === reviewable.length
    const nextOf = (teamId: number) =>
      nextFeedbackTeamId(
        reviewable.map((t) => t.id),
        teamId,
        mine
      )
    const goNext = (teamId: number) => {
      const next = nextOf(teamId)
      setAutoPlayTeamId(autoPlayNext ? next : null)
      void setTeamParam(next ?? COLLAPSED)
      if (next === null) window.scrollTo({ top: 0, behavior: "smooth" })
    }
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
        {finished && (
          <div className="rounded-lg bg-green-50 px-4 py-5 text-center text-sm text-green-800">
            <p className="font-semibold">피드백을 완료했어요</p>
            {performance?.feedbackEndAt && (
              <p className="mt-1">
                {dayjs(performance.feedbackEndAt).format("M월 D일 HH:mm")}까지
                고칠 수 있어요
              </p>
            )}
            <Link
              href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
              className="mt-2 inline-block underline"
            >
              팀 목록으로
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remainingOnly}
              onChange={(e) => void setRemainingOnly(e.target.checked || null)}
            />
            남은 것만 보기
          </label>
          {!readOnly && (
            <label className="flex items-center gap-2">
              <Switch
                checked={autoPlayNext}
                onCheckedChange={(on) => void setAutoPlayNext(on || null)}
              />
              다음 곡 자동 재생
            </label>
          )}
        </div>
        {visible.length === 0 ? (
          !finished && <Notice>남은 곡이 없어요.</Notice>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((team) => (
              <FeedbackRow
                key={team.id}
                team={team}
                status={statusOf(team.id)}
                position={
                  reviewable.some((t) => t.id === team.id)
                    ? {
                        n: reviewable.findIndex((t) => t.id === team.id) + 1,
                        total: reviewable.length
                      }
                    : undefined
                }
                row={mine.feedbacks.find((f) => f.teamId === team.id)}
                expanded={team.id === expandedId}
                readOnly={readOnly}
                hasNext={nextOf(team.id) !== null}
                autoPlay={team.id === autoPlayTeamId}
                onToggle={() => {
                  setAutoPlayTeamId(null)
                  void setTeamParam(
                    team.id === expandedId ? COLLAPSED : team.id
                  )
                }}
                onNext={() => goNext(team.id)}
                onScore={(key: FeedbackDimensionKey, score) =>
                  void save(team.id, { [key]: score })
                }
                onComment={(comment) => save(team.id, { comment })}
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
