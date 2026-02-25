"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GripHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useMiniPlayer } from "./MiniPlayerContext"

const MiniPlayer = () => {
  const { current, close } = useMiniPlayer()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [initialized, setInitialized] = useState(false)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  // Reset position when a new video starts
  useEffect(() => {
    if (current) {
      setPosition({ x: 0, y: 0 })
      setInitialized(false)
    }
  }, [current?.videoId])

  // Set initial position after first render
  useEffect(() => {
    if (current && containerRef.current && !initialized) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({ x: rect.left, y: rect.top })
      setInitialized(true)
    }
  }, [current, initialized])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return
      dragging.current = true
      offset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [position]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    })
  }, [])

  const clampPosition = useCallback((pos: { x: number; y: number }) => {
    const el = containerRef.current
    if (!el) return pos
    const w = el.offsetWidth
    const h = el.offsetHeight
    const margin = 40
    return {
      x: Math.min(Math.max(pos.x, margin - w), window.innerWidth - margin),
      y: Math.min(Math.max(pos.y, margin - h), window.innerHeight - margin)
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    dragging.current = false
    setPosition((prev) => clampPosition(prev))
  }, [clampPosition])

  if (!current) return null

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-[320px] overflow-hidden rounded-xl bg-black shadow-2xl md:w-[400px]"
      style={
        initialized
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : { right: 16, bottom: 16 }
      }
    >
      {/* 드래그 핸들 헤더 */}
      <div
        className="flex cursor-grab items-center justify-between bg-neutral-900 px-3 py-2 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="size-full"
        />
      </div>
    </div>
  )
}

export default MiniPlayer
