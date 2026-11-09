import {
  FEEDBACK_DIMENSIONS,
  FeedbackDimensionKey,
  FeedbackStatus,
  missingDimensions,
  MyFeedbackSummary
} from "@repo/shared-types"
import { ChevronDown, Music } from "lucide-react"
import Image from "next/image"

import WaveformPlayer from "@/components/WaveformPlayer"
import { cn } from "@/lib/utils"

import CommentField from "./CommentField"
import ScoreButtons from "./ScoreButtons"

type FeedbackRowData = MyFeedbackSummary["feedbacks"][number]

const LABEL: Record<FeedbackDimensionKey, string> = Object.fromEntries(
  FEEDBACK_DIMENSIONS.map(({ key, label }) => [key, label])
) as Record<FeedbackDimensionKey, string>

const StatusChip = ({
  status,
  row
}: {
  status: FeedbackStatus
  row: FeedbackRowData | undefined
}) => {
  if (status === "OWN")
    return <span className="text-xs text-slate-400">본인 팀</span>
  if (status === "DONE")
    return (
      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        ✔ 완료
      </span>
    )
  if (status === "PARTIAL")
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        ◐{" "}
        {missingDimensions(row)
          .map((key) => LABEL[key])
          .join("·")}{" "}
        빠짐
      </span>
    )
  return <span className="text-xs text-slate-400">○</span>
}

/** 대상 팀 한 줄. 누르면 그 자리에서 펼쳐 듣고 점수를 매긴다 */
const FeedbackRow = ({
  team,
  status,
  position,
  row,
  expanded,
  readOnly,
  onToggle,
  onScore,
  onComment
}: {
  team: {
    id: number
    name: string
    songName: string
    songArtist: string
    description: string | null
    image: string | null
    recordingUrl: string | null
  }
  status: FeedbackStatus
  /** 본인 팀을 뺀 목록에서 몇 번째인지. 본인 팀은 없음 */
  position: { n: number; total: number } | undefined
  row: FeedbackRowData | undefined
  expanded: boolean
  readOnly: boolean
  onToggle: () => void
  onScore: (key: FeedbackDimensionKey, score: number) => void
  onComment: (comment: string) => Promise<boolean>
}) => {
  const own = status === "OWN"

  return (
    <li
      id={`feedback-team-${team.id}`}
      className={cn(
        "scroll-mt-4 rounded-lg border bg-white",
        expanded ? "border-blue-900" : "border-slate-200",
        own && "bg-slate-50"
      )}
    >
      <button
        type="button"
        disabled={own}
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
      >
        <div
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100 text-slate-400",
            own && "opacity-50"
          )}
        >
          {team.image ? (
            <Image
              src={team.image}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <Music className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-medium",
              own ? "text-slate-400" : "text-slate-900"
            )}
          >
            {position && (
              <span className="mr-1.5 text-sm font-normal tabular-nums text-slate-400">
                [{position.n}/{position.total}]
              </span>
            )}
            {team.songName}
            <span className="ml-1.5 text-sm font-normal text-slate-500">
              {team.songArtist}
            </span>
          </p>
          <p className="truncate text-xs text-slate-500">{team.name}</p>
        </div>
        <StatusChip status={status} row={row} />
        {!own && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-slate-400 transition-transform",
              expanded && "rotate-180"
            )}
          />
        )}
      </button>

      {expanded && team.recordingUrl && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          {team.image && (
            <div className="relative mb-3 aspect-[3/4] w-40 overflow-hidden rounded-md">
              <Image
                src={team.image}
                alt={`${team.songName} 포스터`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          )}
          {team.description && (
            <p className="mb-3 whitespace-pre-line text-sm text-slate-600">
              {team.description}
            </p>
          )}
          <WaveformPlayer
            src={team.recordingUrl}
            title={team.songName}
            artist={team.name}
          />
          <div className="mt-3">
            {FEEDBACK_DIMENSIONS.map(({ key, label }) => (
              <ScoreButtons
                key={key}
                name={`feedback-${team.id}-${key}`}
                label={label}
                value={row?.[key] ?? null}
                disabled={readOnly}
                onChange={(score) => onScore(key, score)}
              />
            ))}
          </div>
          <CommentField
            value={row?.comment ?? null}
            disabled={readOnly}
            onSave={onComment}
          />
        </div>
      )}
    </li>
  )
}

export default FeedbackRow
