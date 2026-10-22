"use client"

import "dayjs/locale/ko"

import { useEffect, useRef, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { useQueryClient } from "@tanstack/react-query"
import { RentalDetail } from "@repo/shared-types"

import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useUpdateRental } from "@/hooks/api/useRental"
import { useAuth } from "@/lib/providers/auth-provider"

import WeekColumn, { DragMode } from "./WeekColumn"

interface WeekCalendarFieldProp {
  currentMonday: Dayjs
  rentals: RentalDetail[]
  onRentalClick?: (rental: RentalDetail) => void
  /** 휴대폰 폭용 — 요일·날짜를 세로로 쌓고 블록엔 제목만 */
  compact?: boolean
}

const DEFAULT_START = 9
const DEFAULT_END = 22
const ROW_H = 42
const SNAP_MIN = 15
const LONG_PRESS_MS = 400
// 이만큼 움직이기 전엔 클릭 — 터치는 길게 누르기 전에 움직이면 스크롤로 넘김
const MOUSE_DRAG_PX = 4
const TOUCH_CANCEL_PX = 8

type Drag = {
  rental: RentalDetail
  mode: DragMode
  pointerId: number
  x0: number
  y0: number
  colWidth: number
  active: boolean
  timer?: ReturnType<typeof setTimeout>
}

type Preview = { id: number; startAt: Date; endAt: Date }

const snapMinutes = (px: number) =>
  Math.round((px / ROW_H) * (60 / SNAP_MIN)) * SNAP_MIN

export default function WeekCalendarField({
  currentMonday,
  rentals,
  onRentalClick,
  compact = false
}: WeekCalendarFieldProp) {
  // 주간 전체 rental의 시간 범위로 동적 확장
  const rentalHours = rentals.map((r) => dayjs(r.startAt).hour())
  const startHour = Math.min(DEFAULT_START, ...rentalHours)
  const endHour = Math.max(DEFAULT_END, ...rentalHours)
  const slotCount = endHour - startHour + 1
  const totalMin = slotCount * 60

  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const updateRental = useUpdateRental()

  const columnsRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<Preview | null>(null)
  // 끌기 직후 따라오는 click(상세 열기)·touchend(주 넘기기 스와이프)를 막음
  const justDraggedRef = useRef(false)
  const [preview, setPreviewState] = useState<Preview | null>(null)
  const setPreview = (p: Preview | null) => {
    previewRef.current = p
    setPreviewState(p)
  }

  // 서버 RentalOwnerGuard·상세 창 삭제 권한과 같은 기준
  const canDrag = (rental: RentalDetail) =>
    !!user && (user.isAdmin || rental.users.some((u) => u.id === user.id))

  const save = (
    rental: RentalDetail,
    startAt: Date,
    endAt: Date,
    isUndo = false
  ) => {
    updateRental.mutate([rental.id, { startAt, endAt }], {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["rentals"] })
        setPreview(null)
        if (isUndo) return
        toast({
          title: `${dayjs(startAt).locale("ko").format("M/D (ddd) HH:mm")}~${dayjs(endAt).format("HH:mm")}로 바꿨어요`,
          // 기본 5초는 되돌리기를 누르기엔 짧음
          duration: 10000,
          action: (
            <ToastAction
              altText="되돌리기"
              onClick={() => {
                setPreview({
                  id: rental.id,
                  startAt: rental.startAt,
                  endAt: rental.endAt
                })
                save(rental, rental.startAt, rental.endAt, true)
              }}
            >
              되돌리기
            </ToastAction>
          )
        })
      },
      onError: (error) => {
        setPreview(null)
        toast({
          variant: "destructive",
          title: "바꾸지 못했어요",
          description: error.detail ?? error.message
        })
      }
    })
  }

  const computePreview = (drag: Drag, dx: number, dy: number): Preview => {
    const start = dayjs(drag.rental.startAt)
    const end = dayjs(drag.rental.endAt)
    const minutes = snapMinutes(dy)
    // 격자에 보이는 시간 범위(startHour ~ endHour+1시) — 밖으로 끌면 블록이 잘리거나 사라짐
    const gridStartOf = (d: Dayjs) => d.startOf("day").add(startHour, "hour")
    const gridEndOf = (d: Dayjs) => d.startOf("day").add(endHour + 1, "hour")
    if (drag.mode === "resize") {
      const minEnd = start.add(SNAP_MIN, "minute")
      const maxEnd = gridEndOf(end)
      let newEnd = end.add(minutes, "minute")
      if (newEnd.isBefore(minEnd)) newEnd = minEnd
      if (newEnd.isAfter(maxEnd)) newEnd = maxEnd
      return {
        id: drag.rental.id,
        startAt: start.toDate(),
        endAt: newEnd.toDate()
      }
    }
    // 주 밖으로는 못 옮김 — 시작일이 이번 주 7일 안에 머물게
    const dayIndex = Math.min(
      6,
      Math.max(0, start.startOf("day").diff(currentMonday, "day"))
    )
    const days = Math.min(
      6 - dayIndex,
      Math.max(-dayIndex, Math.round(dx / drag.colWidth))
    )
    // 시작 시각만 그날 보이는 범위 안에 묶고, 길이는 그대로 (밤을 넘기는 예약 허용)
    const day = start.add(days, "day")
    const lo = gridStartOf(day)
    const hi = gridEndOf(day).subtract(SNAP_MIN, "minute")
    let newStart = day.add(minutes, "minute")
    if (newStart.isBefore(lo)) newStart = lo
    if (newStart.isAfter(hi)) newStart = hi
    const shift = newStart.diff(start, "minute")
    return {
      id: drag.rental.id,
      startAt: newStart.toDate(),
      endAt: end.add(shift, "minute").toDate()
    }
  }

  const handleBlockPointerDown = (
    e: React.PointerEvent,
    rental: RentalDetail,
    mode: DragMode
  ) => {
    justDraggedRef.current = false
    if (!canDrag(rental) || updateRental.isPending || !columnsRef.current)
      return
    const isTouch = e.pointerType === "touch"
    // 오른쪽·가운데 버튼은 끌기로 보지 않음
    if (!isTouch && e.button !== 0) return
    // 휴대폰은 칸이 좁아 길이 조절 없이 이동만
    if (isTouch && mode === "resize") return

    const drag: Drag = {
      rental,
      mode,
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      colWidth: columnsRef.current.getBoundingClientRect().width / 7,
      active: false
    }
    const activate = () => {
      drag.active = true
      justDraggedRef.current = true
      navigator.vibrate?.(30)
      setPreview(computePreview(drag, 0, 0))
    }
    if (isTouch) drag.timer = setTimeout(activate, LONG_PRESS_MS)

    const cleanup = () => {
      clearTimeout(drag.timer)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      window.removeEventListener("touchmove", blockScroll)
    }
    // 끌기를 시작한 손가락·포인터만 따라감 — 두 번째 손가락이 미리보기를 바꾸거나 저장하지 않게
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return
      const dx = ev.clientX - drag.x0
      const dy = ev.clientY - drag.y0
      if (!drag.active) {
        const dist = Math.hypot(dx, dy)
        if (isTouch) {
          if (dist > TOUCH_CANCEL_PX) cleanup()
          return
        }
        if (dist < MOUSE_DRAG_PX) return
        activate()
      }
      setPreview(computePreview(drag, dx, dy))
    }
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return
      const wasActive = drag.active
      cleanup()
      if (!wasActive) return
      const p = previewRef.current
      const unchanged =
        !p ||
        (p.startAt.getTime() === new Date(rental.startAt).getTime() &&
          p.endAt.getTime() === new Date(rental.endAt).getTime())
      if (unchanged) setPreview(null)
      else save(rental, p.startAt, p.endAt)
    }
    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return
      cleanup()
      setPreview(null)
    }
    // 길게 누른 뒤 끄는 동안 화면이 스크롤되지 않게
    const blockScroll = (ev: TouchEvent) => {
      if (drag.active) ev.preventDefault()
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    window.addEventListener("touchmove", blockScroll, { passive: false })
  }

  const displayRentals = preview
    ? rentals.map((r) =>
        r.id === preview.id
          ? { ...r, startAt: preview.startAt, endAt: preview.endAt }
          : r
      )
    : rentals

  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
  }, [])

  const nowTopPx = (() => {
    if (!now) return 0
    const minutesSinceStart =
      (now.getHours() - startHour) * 60 + now.getMinutes()
    const clampedMin = Math.max(0, Math.min(totalMin, minutesSinceStart))
    return (clampedMin * ROW_H) / 60 + 42
  })()

  const timeLabel = now?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
  return (
    <div
      className={`w-full flex bg-white rounded-xl overflow-hidden ${compact ? "" : "mt-7"}`}
    >
      <div className="w-7 flex flex-col shrink-0">
        <div className="h-[42px]" />
        {Array.from({ length: slotCount }).map((_, i) => {
          const absHour = i + startHour
          const hour = absHour % 12 === 0 ? 12 : absHour % 12
          const isPM = absHour >= 12

          return (
            <div
              key={i}
              className="text-[8px] w-full h-[42px] text-center text-gray-400"
            >
              {hour}
              {isPM ? "PM" : "AM"}
            </div>
          )
        })}
      </div>
      <div ref={columnsRef} className="flex-1 relative flex">
        {Array.from({ length: 7 }).map((_, i) => (
          <WeekColumn
            nowTopPx={nowTopPx}
            offset={i}
            currentMonday={currentMonday}
            rentals={displayRentals}
            onRentalClick={(rental) => {
              if (justDraggedRef.current) {
                justDraggedRef.current = false
                return
              }
              onRentalClick?.(rental)
            }}
            canDrag={canDrag}
            draggingId={preview?.id ?? null}
            onBlockPointerDown={handleBlockPointerDown}
            onBlockTouchEnd={(e) => {
              if (justDraggedRef.current) e.stopPropagation()
            }}
            startHour={startHour}
            slotCount={slotCount}
            compact={compact}
            key={i}
          />
        ))}
        {now && (
          <div
            className="w-full absolute bg-destructive h-[1px]"
            style={{ top: `${nowTopPx}px` }}
          >
            <div className="w-full relative">
              {/* 휴대폰에선 시간 열이 좁아 라벨이 첫 날 칸을 가림 */}
              {!compact && (
                <div className="absolute w-11 flex items-center justify-center -translate-y-1/2 h-4 rounded-lg text-[10px] text-white bg-destructive -left-5">
                  {timeLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
