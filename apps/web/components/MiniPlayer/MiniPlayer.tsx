"use client"

import { GripHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClampFn, useDraggable } from "@/hooks/useDraggable"

import { useMiniPlayer } from "./MiniPlayerContext"

// 일부가 화면 밖으로 나가도 40px은 남겨서 다시 잡을 수 있게
const clampPartiallyVisible: ClampFn = (pos, { width, height }) => {
  const margin = 40
  return {
    x: Math.min(Math.max(pos.x, margin - width), window.innerWidth - margin),
    y: Math.min(Math.max(pos.y, margin - height), window.innerHeight - margin)
  }
}

const MiniPlayer = () => {
  const { current, close } = useMiniPlayer()
  const { ref, position, initialized, handlers } = useDraggable<HTMLDivElement>(
    { enabled: !!current, clamp: clampPartiallyVisible }
  )

  if (!current) return null

  return (
    <div
      ref={ref}
      className="fixed z-50 w-[320px] overflow-hidden rounded-xl bg-black shadow-2xl md:w-[400px]"
      style={
        initialized
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : { right: 16, bottom: "calc(var(--tabbar-height) + 16px)" }
      }
    >
      {/* 드래그 핸들 헤더 */}
      <div
        className="flex cursor-grab items-center justify-between bg-neutral-900 px-3 py-2 active:cursor-grabbing"
        {...handlers}
      >
        <div className="flex min-w-0 items-center gap-2">
          <GripHorizontal className="size-3.5 shrink-0 text-neutral-500" />
          <span className="truncate text-xs text-white">{current.title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-white hover:bg-neutral-700"
          onClick={close}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* 플레이어 */}
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&rel=0`}
          title={current.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="size-full"
        />
      </div>
    </div>
  )
}

export default MiniPlayer
