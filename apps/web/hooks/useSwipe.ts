import { useRef } from "react"

const MIN_DISTANCE_PX = 50

/**
 * 좌우 스와이프를 감지하는 터치 핸들러를 반환한다.
 * 가로 이동이 세로 이동보다 클 때만 스와이프로 보고, 세로 스크롤은 건드리지 않는다.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight
}: {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (touch) start.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const touch = e.changedTouches[0]
      if (!start.current || !touch) return
      const dx = touch.clientX - start.current.x
      const dy = touch.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < MIN_DISTANCE_PX || Math.abs(dx) <= Math.abs(dy)) return
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    }
  }
}
