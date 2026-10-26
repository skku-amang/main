"use client"

import { useState } from "react"
import Cropper, { type Area } from "react-easy-crop"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

// 아바타는 작게 보이므로 이보다 크게 저장할 필요 없음
const OUTPUT_SIZE = 512

async function cropToSquareFile(src: string, area: Area): Promise<File> {
  const image = new Image()
  image.src = src
  await image.decode()

  const size = Math.min(OUTPUT_SIZE, area.width)
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  canvas
    .getContext("2d")
    ?.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      size,
      size
    )

  // WebP 인코딩을 못 하는 브라우저(구형 Safari)는 PNG로 돌려줌
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9)
  )
  if (!blob) throw new Error("이미지를 자르지 못했습니다.")
  const ext = blob.type.split("/")[1] ?? "png"
  return new File([blob], `avatar.${ext}`, { type: blob.type })
}

interface AvatarCropDialogProps {
  /** 고른 사진의 미리보기 주소. 있으면 창이 열림 */
  src: string | null
  onCancel: () => void
  onConfirm: (file: File) => void
}

const AvatarCropDialog = ({
  src,
  onCancel,
  onConfirm
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const handleConfirm = async () => {
    if (!src || !area) return
    setIsCropping(true)
    try {
      onConfirm(await cropToSquareFile(src, area))
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <Dialog
      open={!!src}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent
        className="rounded-2xl sm:max-w-md"
        // 입력 창 — 바깥을 잘못 눌러 입력이 사라지지 않게. 닫기는 [취소]·Esc
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>프로필 사진 자르기</DialogTitle>
          <DialogDescription>
            사진을 끌어 위치를, 막대로 크기를 맞춰주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-slate-900">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>

        <input
          type="range"
          aria-label="확대"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!area || isCropping}
          >
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AvatarCropDialog
