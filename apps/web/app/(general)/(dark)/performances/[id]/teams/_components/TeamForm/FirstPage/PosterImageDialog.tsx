"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useImageUpload } from "@/hooks/useImageUpload"
import { cn } from "@/lib/utils"
import { ACCEPTED_IMAGE_TYPES } from "@repo/shared-types"

import basicInfoSchema from "./schema"

interface PosterImageDialogProps {
  form: ReturnType<typeof useForm<z.infer<typeof basicInfoSchema>>>
}

function PosterImageDialog({ form }: PosterImageDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const currentImage = form.watch("posterImage")

  const {
    file,
    preview,
    isUploading,
    error,
    inputRef,
    handleFileSelect,
    upload,
    reset
  } = useImageUpload({
    onSuccess: (publicUrl) => {
      form.setValue("posterImage", publicUrl)
      setOpen(false)
      reset()
    }
  })

  function handleRemove(): void {
    form.setValue("posterImage", "")
    reset()
  }

  function handleDragOver(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    const fakeEvent = {
      target: { files: [droppedFile] }
    } as unknown as React.ChangeEvent<HTMLInputElement>
    handleFileSelect(fakeEvent)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) reset()
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
            Image Upload
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl">
        <div>
          <DialogHeader className="mb-1">
            <DialogTitle className="text-slate-900">Image Upload</DialogTitle>
            <DialogDescription className="text-zinc-500">
              홍보 포스터를 업로드하여 주세요
            </DialogDescription>
          </DialogHeader>

          {currentImage && !preview && (
            <div className="relative mb-4">
              <div className="relative max-h-[300px] w-full overflow-hidden rounded-lg">
                <img
                  src={currentImage}
                  alt="현재 포스터"
                  className="h-full w-full object-contain"
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

          {preview ? (
            <div>
              <div className="relative max-h-[300px] w-full overflow-hidden rounded-lg">
                <img
                  src={preview}
                  alt="미리보기"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-3 flex gap-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => reset()}
                >
                  다시 선택
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-secondary"
                  disabled={!file || isUploading}
                  onClick={upload}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "업로드"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="poster-file-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
                isDragging
                  ? "border-secondary bg-secondary/5"
                  : "border-blue-300 bg-slate-50"
              )}
            >
              <ImagePlus size={40} className="text-blue-300" />
              <p className="text-sm text-zinc-500">
                파일을 드래그하거나{" "}
                <span className="font-medium text-secondary">찾아보기</span>
              </p>
              <input
                id="poster-file-input"
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}

          {error && (
            <div className="mt-2 text-xs text-destructive">{error}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PosterImageDialog
