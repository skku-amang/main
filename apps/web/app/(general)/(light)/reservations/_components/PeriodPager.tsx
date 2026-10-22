"use client"

import { useRef } from "react"
import { flushSync } from "react-dom"

// 이만큼 움직인 뒤 가로/세로 중 더 많이 간 쪽으로 방향을 정함
const AXIS_LOCK_PX = 10
const MIN_DISTANCE_PX = 50
const SLIDE_MS = 200

type Offset = -1 | 0 | 1

const translate = (panel: number, px = 0) =>
  `translateX(calc(${(-1 - panel) * (100 / 3)}% + ${px}px))`

interface PeriodPagerProps {
  onPrev: () => void
  onNext: () => void
  /** -1: 이전 기간, 0: 현재, 1: 다음 — 세 장을 가로로 늘어놓고 손가락을 따라 넘긴다 */
  renderPanel: (offset: Offset) => React.ReactNode
  /** 장마다 기간을 나타내는 key — 넘긴 뒤에도 이미 그린 장을 그대로 재사용 */
  panelKey: (offset: Offset) => string
}

/**
 * 달력 넘기기 — 이전·현재·다음 기간을 나란히 그려 두고 손가락을 따라 움직이다가,
 * 기준을 넘겨 놓으면 옆 장으로 붙은 뒤 기간을 바꾸고 다시 가운데로 맞춘다.
 * 세로로 먼저 움직이면 스크롤로 보고 건드리지 않는다.
 *
 * 끄는 동안은 React 상태 없이 transform만 직접 바꾼다 — 상태로 들면 터치마다 달력 세 장이
 * 다시 그려져 프레임이 떨어짐.
 */
export default function PeriodPager({
  onPrev,
  onNext,
  renderPanel,
  panelKey
}: PeriodPagerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const axis = useRef<"x" | "y" | null>(null)
  // 넘김 애니메이션 중 붙을 장 (-1 이전, 1 다음), 0이면 제자리
  const sliding = useRef<Offset | null>(null)

  const move = (transform: string, animate: boolean) => {
    const track = trackRef.current
    if (!track) return
    track.style.transition = animate ? `transform ${SLIDE_MS}ms ease-out` : ""
    track.style.transform = transform
  }

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return
    const dir = sliding.current
    sliding.current = null
    if (dir === 1 || dir === -1) {
      // 새 기간을 먼저 그린 뒤 가운데로 되돌려야 옛 화면이 한 프레임 비치지 않음
      flushSync(dir === 1 ? onNext : onPrev)
    }
    move(translate(0), false)
  }

  return (
    <div
      className="touch-pan-y overflow-hidden"
      onTouchStart={(e) => {
        const touch = e.touches[0]
        if (!touch || sliding.current !== null) return
        start.current = { x: touch.clientX, y: touch.clientY }
        axis.current = null
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0]
        if (!start.current || !touch) return
        const dx = touch.clientX - start.current.x
        const dy = touch.clientY - start.current.y
        if (!axis.current && Math.hypot(dx, dy) > AXIS_LOCK_PX)
          axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
        if (axis.current === "x") move(translate(0, dx), false)
      }}
      onTouchEnd={(e) => {
        const touch = e.changedTouches[0]
        const s = start.current
        start.current = null
        if (!s || !touch || axis.current !== "x") return
        const dx = touch.clientX - s.x
        const dir: Offset = Math.abs(dx) < MIN_DISTANCE_PX ? 0 : dx < 0 ? 1 : -1
        sliding.current = dir
        move(translate(dir), true)
      }}
    >
      <div
        ref={trackRef}
        className="flex w-[300%] items-start will-change-transform"
        style={{ transform: translate(0) }}
        onTransitionEnd={handleTransitionEnd}
      >
        {([-1, 0, 1] as const).map((offset) => (
          <div
            key={panelKey(offset)}
            className="w-1/3 shrink-0"
            // 옆 장은 화면 밖 — 키보드·화면낭독기에선 건너뜀
            aria-hidden={offset !== 0}
            inert={offset !== 0}
          >
            {renderPanel(offset)}
          </div>
        ))}
      </div>
    </div>
  )
}
