import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"

import { useUpdateTeamRecording } from "@/hooks/api/useTeam"
import { useGetRecordingPresignedUrl } from "@/hooks/api/useUpload"
import { putFileWithProgress } from "@/lib/upload"
import { ApiError } from "@repo/api-client"
import { ACCEPTED_AUDIO_TYPES, MAX_RECORDING_SIZE } from "@repo/shared-types"

function validateRecording(file: File): string | null {
  if (!ACCEPTED_AUDIO_TYPES.includes(file.type))
    return "음원 파일만 올릴 수 있어요. (MP3, M4A, WAV)"
  if (file.size > MAX_RECORDING_SIZE) return "녹음본은 50MB 이하여야 합니다."
  return null
}

const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? (error.detail ?? error.message)
    : "업로드 중 오류가 발생했습니다. 다시 시도해주세요."

/** 녹음본 고르기 → 저장소에 직접 올리기 → 팀에 저장. 지우기도 같은 API(null) */
export function useRecordingUpload(teamId: number) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const queryClient = useQueryClient()

  const { mutateAsync: getPresignedUrl } = useGetRecordingPresignedUrl()
  const { mutateAsync: updateRecording, isPending: isSaving } =
    useUpdateTeamRecording()

  async function save(recordingUrl: string | null) {
    await updateRecording([teamId, { recordingUrl }])
    await queryClient.invalidateQueries({ queryKey: ["team", teamId] })
    await queryClient.invalidateQueries({ queryKey: ["teams"] })
  }

  async function selectAndUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ""
    if (!file) return

    const invalid = validateRecording(file)
    setError(invalid)
    if (invalid) return

    setIsUploading(true)
    setProgress(0)
    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl([
        { filename: file.name, contentType: file.type, size: file.size }
      ])
      await putFileWithProgress(uploadUrl, file, {
        onProgress: setProgress,
        xhrRef
      })
      await save(publicUrl)
    } catch (err) {
      if ((err as Error).message !== "Upload cancelled")
        setError(errorMessage(err))
    } finally {
      xhrRef.current = null
      setIsUploading(false)
    }
  }

  async function remove() {
    setError(null)
    try {
      await save(null)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  function cancel() {
    xhrRef.current?.abort()
  }

  return {
    isUploading,
    isSaving,
    progress,
    error,
    inputRef,
    selectAndUpload,
    remove,
    cancel
  }
}
