"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useGetPresignedUrl } from "@/hooks/api/useUpload"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@repo/shared-types"

import basicInfoSchema from "./schema"

interface PosterImageDialogProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
}

const PosterImageDialog = ({ form }: PosterImageDialogProps) => {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl()

  const currentImage = form.getValues("posterImage")

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 크기는 20MB 이하여야 합니다.")
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleUpload() {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const { uploadUrl, publicUrl } = await getPresignedUrl([
        { filename: selectedFile.name, contentType: selectedFile.type }
      ])

      await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type }
      })

      form.setValue("posterImage", publicUrl)
      setOpen(false)
      resetState()
    } catch {
      setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove() {
    form.setValue("posterImage", "")
    resetState()
  }

  function resetState() {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetState()
      }}
    >
      <DialogTrigger>
        <Button
          asChild
          variant="outline"
          type="button"
          className="border border-secondary text-secondary hover:bg-secondary hover:text-white"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center justify-center gap-x-2.5">
            <ImagePlus size={24} />
            포스터 이미지
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="rounded-xl">
        <div className="rounded-xl">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-slate-900">포스터 이미지</DialogTitle>
          </DialogHeader>

          <p className="mb-4 text-sm text-zinc-500">
            팀 포스터 이미지를 업로드해주세요. (선택사항)
          </p>

          {/* 현재 업로드된 이미지 표시 */}
          {currentImage && !preview && (
            <div className="relative mb-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                <Image
                  src={currentImage}
                  alt="현재 포스터"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-2 w-full"
                onClick={handleRemove}
              >
                <X size={16} className="mr-1" />
                이미지 삭제
              </Button>
            </div>
          )}

          {/* 파일 선택 */}
          <div className="flex items-center gap-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-secondary/90"
            />
            <Button
              type="button"
              className="bg-secondary"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Upload"
              )}
            </Button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-1 text-xs text-destructive">{error}</div>
          )}

          {/* 미리보기 */}
          {preview && (
            <div className="relative mt-4 aspect-[3/4] w-full overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt="미리보기"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PosterImageDialog
