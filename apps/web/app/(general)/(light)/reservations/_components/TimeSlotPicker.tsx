"use client"

import { Fragment, useLayoutEffect, useRef } from "react"
import dayjs from "dayjs"
import type { TimeSlot } from "@repo/shared-types"

import { cn } from "@/lib/utils"

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  busy: boolean[]
  tappable: boolean[]
  /** 고른 색으로 칠할 칸 */
  selected: boolean[]
  onTap: (index: number) => void
  loading?: boolean
}

export default function TimeSlotPicker({
  slots,
  busy,
  tappable,
  selected,
  onTap,
  loading = false
}: TimeSlotPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const firstNextDay = slots.findIndex((s) => s.nextDay)

  // 처음 그릴 때 고른 칸(없으면 누를 수 있는 첫 칸)이 보이게 — 다이얼로그는 움직이지 않도록 목록 안에서만
  const scrolled = useRef(false)
  useLayoutEffect(() => {
    const container = scrollRef.current
    if (scrolled.current || loading || !container) return
    const target = selected.includes(true)
      ? selected.indexOf(true)
      : tappable.indexOf(true)
    if (target < 0) return
    const button = container.querySelector<HTMLElement>(
      `[data-slot-index="${target}"]`
    )
    if (!button) return
    // 목록이 relative라 버튼의 offsetTop은 목록 기준
    container.scrollTop = button.offsetTop - 4
    scrolled.current = true
  }, [loading, selected, tappable])

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="예약 시간"
      aria-busy={loading}
      className="relative max-h-64 overflow-y-auto p-1"
    >
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((slot, i) => {
          const time = dayjs(slot.startAt).format("HH:mm")
          return (
            <Fragment key={slot.startAt.getTime()}>
              {i === firstNextDay && (
                <p className="col-span-4 py-1 text-center text-xs text-muted-foreground">
                  ── {dayjs(slot.startAt).locale("ko").format("M월 D일 (ddd)")}{" "}
                  새벽 ──
                </p>
              )}
              <button
                type="button"
                data-slot-index={i}
                onClick={() => onTap(i)}
                disabled={loading || !tappable[i]}
                aria-pressed={selected[i]}
                aria-label={busy[i] ? `${time} 예약됨` : time}
                className={cn(
                  "h-9 rounded-md border text-sm tabular-nums transition-colors",
                  selected[i]
                    ? "border-primary bg-primary text-primary-foreground"
                    : busy[i]
                      ? "border-transparent bg-muted text-muted-foreground line-through"
                      : "bg-background hover:bg-accent disabled:text-muted-foreground disabled:hover:bg-background",
                  loading && "animate-pulse"
                )}
              >
                {time}
              </button>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
