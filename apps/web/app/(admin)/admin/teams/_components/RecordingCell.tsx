"use client"

import { Upload } from "lucide-react"
import { useEffect } from "react"

import RecordingPlayButton from "@/components/RecordingPlayButton"
import { useToast } from "@/components/hooks/use-toast"
import { useRecordingUpload } from "@/hooks/useRecordingUpload"
import { ACCEPTED_AUDIO_TYPES } from "@repo/shared-types"

/** 운영진 팀 표의 녹음본 칸 — 재생 또는 미제출 표시, 제출 단계까지는 올리기·바꾸기 */
const RecordingCell = ({
  teamId,
  recordingUrl,
  canUpload
}: {
  teamId: number
  recordingUrl: string | null
  canUpload: boolean
}) => {
  const recording = useRecordingUpload(teamId)
  const { toast } = useToast()

  useEffect(() => {
    if (recording.error)
      toast({
        title: "녹음본을 올리지 못했어요",
        description: recording.error,
        variant: "destructive"
      })
  }, [recording.error, toast])

  return (
    <div className="flex items-center gap-1.5">
      {recordingUrl ? (
        <RecordingPlayButton src={recordingUrl} />
      ) : (
        <span role="img" aria-label="미제출" title="미제출">
          ❌
        </span>
      )}
      {canUpload &&
        (recording.isUploading ? (
          <span className="text-xs tabular-nums text-slate-500">
            {recording.progress}%
          </span>
        ) : (
          <>
            <input
              ref={recording.inputRef}
              type="file"
              accept={ACCEPTED_AUDIO_TYPES.join(",")}
              className="hidden"
              onChange={recording.selectAndUpload}
            />
            <button
              type="button"
              disabled={recording.isSaving}
              onClick={() => recording.inputRef.current?.click()}
              aria-label={recordingUrl ? "녹음본 바꾸기" : "녹음본 올리기"}
              title={recordingUrl ? "녹음본 바꾸기" : "녹음본 올리기"}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Upload className="size-4" />
            </button>
          </>
        ))}
    </div>
  )
}

export default RecordingCell
