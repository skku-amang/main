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
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl()

  function validateFile(selected: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      return "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)"
    }
    if (selected.size > MAX_FILE_SIZE) {
      return "파일 크기는 20MB 이하여야 합니다."
    }
    return null
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setError(null)
    setIsUploaded(false)

    const validationError = validateFile(selected)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function uploadFile(targetFile: File) {
    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl([
        { filename: targetFile.name, contentType: targetFile.type }
      ])

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error("Upload failed"))
        })
        xhr.addEventListener("error", () => reject(new Error("Upload failed")))
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload cancelled"))
        )
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", targetFile.type)
        xhr.send(targetFile)
      })

      xhrRef.current = null
      setIsUploaded(true)
      setFile(null)
      options?.onSuccess?.(publicUrl)
    } catch (err) {
      xhrRef.current = null
      if ((err as Error).message !== "Upload cancelled") {
        setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  async function upload() {
    if (!file) return
    await uploadFile(file)
  }

  async function selectAndUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setError(null)
    setIsUploaded(false)

    const validationError = validateFile(selected)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    await uploadFile(selected)
  }

  function cancelUpload() {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    reset()
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setError(null)
    setIsUploaded(false)
    setProgress(0)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return {
    file,
    preview,
    isUploading,
    progress,
    isUploaded,
    error,
    inputRef,
    handleFileSelect,
    selectAndUpload,
    upload,
    cancelUpload,
    reset
  }
}
