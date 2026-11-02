"use client"

import SessionSetCard from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/SessionSetCard"
import { Button } from "@/components/ui/button"
import WaveformPlayer from "@/components/WaveformPlayer"
import { useRecordingUpload } from "@/hooks/useRecordingUpload"
import { ACCEPTED_AUDIO_TYPES, type TeamDetail } from "@repo/shared-types"

interface RecordingCardProps {
  team: TeamDetail
  /** 팀장·운영진이고 아직 제출 단계까지일 때 */
  canEdit: boolean
}

const RecordingCard = ({ team, canEdit }: RecordingCardProps) => {
  const recording = useRecordingUpload(team.id)
  const busy = recording.isUploading || recording.isSaving

  function handleRemove() {
    if (confirm("녹음본을 지울까요? 지운 파일은 되돌릴 수 없어요.")) {
      recording.remove()
    }
  }

  return (
    <SessionSetCard
      header="녹음본"
      className="bg-white shadow-[0_4px_30px_0_rgba(59,130,246,0.07)]"
    >
      <div className="mt-4 space-y-3 md:mt-6">
        {team.recordingUrl ? (
          <WaveformPlayer src={team.recordingUrl} />
        ) : (
          <p className="text-sm text-gray-500">아직 녹음본이 없어요.</p>
        )}

        {canEdit && (
          <>
            <input
              ref={recording.inputRef}
              type="file"
              accept={ACCEPTED_AUDIO_TYPES.join(",")}
              className="hidden"
              onChange={recording.selectAndUpload}
            />
            {recording.isUploading ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  올리는 중 {recording.progress}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={recording.cancel}
                >
                  취소
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outlinePrimary"
                  shape="round"
                  disabled={busy}
                  onClick={() => recording.inputRef.current?.click()}
                >
                  {team.recordingUrl ? "다른 파일로 바꾸기" : "녹음본 올리기"}
                </Button>
                {team.recordingUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    shape="round"
                    disabled={busy}
                    onClick={handleRemove}
                  >
                    지우기
                  </Button>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400">
              MP3·M4A·WAV, 50MB 이하. 피드백이 시작되면 바꿀 수 없어요.
            </p>
            {recording.error && (
              <p className="text-sm text-destructive">{recording.error}</p>
            )}
          </>
        )}
      </div>
    </SessionSetCard>
  )
}

export default RecordingCard
