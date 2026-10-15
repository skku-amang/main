"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Position = { x: number; y: number }
type Size = { width: number; height: number }

export type ClampFn = (pos: Position, size: Size) => Position

// 이 거리 미만으로 움직이면 드래그가 아니라 탭(클릭)으로 본다
const DRAG_THRESHOLD = 5

/**
 * fixed 요소를 포인터로 끌어 옮긴다. 처음엔 CSS(right/bottom 등)로 놓인 자리에서 시작하고,
 * 첫 렌더 후 실제 좌표를 읽어 left/top 제어로 넘어간다.
 *
 * 사용자가 놓은 자리(preferred)와 실제 그리는 자리(position)를 분리한다. 화면 크기나
 * 페이지(reclampKey)가 바뀌면 preferred를 다시 clamp해 그리므로, 잠시 비켜났다가도
 * 조건이 풀리면 원래 자리로 돌아온다.
 */
export const useDraggable = <T extends HTMLElement>({
  enabled = true,
  clamp,
  initialPosition,
  onDragEnd,
  reclampKey
}: {
  enabled?: boolean
  clamp: ClampFn
  initialPosition?: Position | null
  onDragEnd?: (pos: Position) => void
  /** 바뀌면 preferred 위치를 다시 clamp (예: 페이지마다 피해야 할 요소가 다를 때 pathname) */
  reclampKey?: unknown
}) => {
  const ref = useRef<T>(null)
  const [position, setPositionState] = useState<Position>({ x: 0, y: 0 })
  const positionRef = useRef(position)
  const preferredRef = useRef<Position | null>(null)
  const setPosition = useCallback((pos: Position) => {
    positionRef.current = pos
    setPositionState(pos)
  }, [])
  const [initialized, setInitialized] = useState(false)
  const dragging = useRef(false)
  const start = useRef<Position>({ x: 0, y: 0 })
  const offset = useRef<Position>({ x: 0, y: 0 })
  const moved = useRef(false)

  const sizeOf = (el: HTMLElement): Size => ({
    width: el.offsetWidth,
    height: el.offsetHeight
  })

  useEffect(() => {
    if (!enabled || initialized || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    preferredRef.current = initialPosition ?? { x: rect.left, y: rect.top }
    setPosition(clamp(preferredRef.current, sizeOf(el)))
    setInitialized(true)
  }, [enabled, initialized, initialPosition, clamp, setPosition])

  const reclamp = useCallback(() => {
    const el = ref.current
    if (el && preferredRef.current)
      setPosition(clamp(preferredRef.current, sizeOf(el)))
  }, [clamp, setPosition])

  // 화면 회전·창 크기 변경 시 화면 밖으로 밀려나지 않게
  useEffect(() => {
    if (!initialized) return
    window.addEventListener("resize", reclamp)
    return () => window.removeEventListener("resize", reclamp)
  }, [initialized, reclamp])

  // 새 페이지의 고정 요소가 그려진 다음 프레임에 다시 계산
  useEffect(() => {
    if (!initialized) return
    const id = requestAnimationFrame(reclamp)
    return () => cancelAnimationFrame(id)
  }, [initialized, reclampKey, reclamp])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!ref.current) return
    dragging.current = true
    moved.current = false
    start.current = { x: e.clientX, y: e.clientY }
    offset.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      if (
        Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) >=
        DRAG_THRESHOLD
      ) {
        moved.current = true
      }
      if (!moved.current) return
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y
      })
    },
    [setPosition]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
    const el = ref.current
    if (!el || !moved.current) return
    const next = clamp(positionRef.current, sizeOf(el))
    preferredRef.current = next
    setPosition(next)
    onDragEnd?.(next)
  }, [clamp, onDragEnd, setPosition])

  return {
    ref,
    position,
    initialized,
    /** 마지막 포인터 동작이 드래그였는지 — 드래그 직후 click을 무시할 때 사용 */
    wasDragged: () => moved.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp }
  }
}
