"use client"

import { ScanSearch } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface PosterImageProps {
  src: string
}

const PosterImage = ({ src }: PosterImageProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="group relative hidden aspect-[3/4] w-full cursor-pointer overflow-clip rounded-[20px] md:block"
        onClick={() => setOpen(true)}
      >
        <Image
          className="rounded-[20px] object-cover"
          src={src}
          alt="poster"
          fill
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 p-2.5 text-slate-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          <ScanSearch size={20} />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay
            className="cursor-pointer bg-black/90"
            onClick={() => setOpen(false)}
          />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            onClick={() => setOpen(false)}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogPrimitive.Title className="sr-only">
              포스터 이미지
            </DialogPrimitive.Title>
            <div
              className="relative h-full w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt="poster fullscreen"
                fill
                className="object-contain"
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}

export default PosterImage
