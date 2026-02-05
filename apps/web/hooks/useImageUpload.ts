import { useRef, useState } from "react"

import { useGetPresignedUrl } from "@/hooks/api/useUpload"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@repo/shared-types"

interface UseImageUploadOptions {
  onSuccess?: (publicUrl: string) => void
}

export function useImageUpload(options?: UseImageUploadOptions) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setError(null)
    setIsUploaded(false)

    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)")
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("파일 크기는 20MB 이하여야 합니다.")
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function upload() {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl([
        { filename: file.name, contentType: file.type }
      ])

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      })

      setIsUploaded(true)
      setFile(null)
      options?.onSuccess?.(publicUrl)
    } catch {
      setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsUploading(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setError(null)
    setIsUploaded(false)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return {
    file,
    preview,
    isUploading,
    isUploaded,
    error,
    inputRef,
    handleFileSelect,
    upload,
    reset
  }
}
