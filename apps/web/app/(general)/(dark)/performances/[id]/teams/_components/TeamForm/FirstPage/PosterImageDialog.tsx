"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
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

  function handleBrowseClick(): void {
    inputRef.current?.click()
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
      <DialogContent className="rounded-xl">
        <div className="rounded-xl">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-slate-900">Image Upload</DialogTitle>
            <DialogDescription className="text-zinc-500">
              홍보 포스터를 업로드하여 주세요
            </DialogDescription>
          </DialogHeader>

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

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-y-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
              isDragging
                ? "border-secondary bg-secondary/5"
                : "border-blue-300 bg-slate-50"
            )}
          >
            <ImagePlus size={40} className="text-blue-300" />
            <p className="text-sm text-zinc-500">Drag your file(s)</p>
            <p className="text-xs text-zinc-400">or</p>
            <button
              type="button"
              onClick={handleBrowseClick}
              className="cursor-pointer text-sm font-medium text-secondary hover:underline"
            >
              browse
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mt-2 text-xs text-destructive">{error}</div>
          )}

          {preview && (
            <div className="mt-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt="미리보기"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                className="mt-3 w-full bg-secondary"
                disabled={!file || isUploading}
                onClick={upload}
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PosterImageDialog
