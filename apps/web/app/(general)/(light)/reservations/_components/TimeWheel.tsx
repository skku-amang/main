"use client"

import { useEffect, useRef, useState } from "react"
import { minuteOptions } from "@repo/shared-types"

import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker"

const pad = (n: number) => String(n).padStart(2, "0")
const toOption = (n: number) => ({ value: n, label: pad(n) })
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => toOption(h))
const ITEM_HEIGHT = 36

// 생성된 wheel-picker.tsx는 Tailwind v4 문법(inset-ring 등)이라 v3에서 빠지는 포커스 표시를 여기서 채운다.
// 글자 크기는 라이브러리 CSS와 우선순위가 같아 로드 순서에 따라 갈리므로, 라이브러리 규칙이 없는 highlightItem에만 준다.
// 강조 띠는 열마다 끊기지 않게 휠 전체에 하나만 깔고(아래 band) 열의 띠는 투명하게 둔다
const WHEEL_CLASS_NAMES = {
  highlightWrapper:
    "bg-transparent data-[rwp-focused]:ring-2 data-[rwp-focused]:ring-inset data-[rwp-focused]:ring-zinc-300",
  highlightItem: "text-lg font-semibold"
}

interface TimeWheelProps {
  /** "HH:mm" */
  value: string
  onChange: (value: string) => void
  label: string
}

export default function TimeWheel({ value, onChange, label }: TimeWheelProps) {
  const [hour = 0, minute = 0] = value.split(":").map(Number)
  // 처음 값 기준으로 한 번만 — 15분 단위가 아닌 기존 분에서 옮겨도 그 칸이 사라지지 않게
  const [minutes] = useState(() => minuteOptions(minute).map(toOption))

  // 두 열이 같은 프레임에 멈추면 props가 갱신되기 전에 콜백이 연달아 온다 — 마지막 값을 기준으로 이어 붙인다
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])
  const change = (part: "hour" | "minute", n: number) => {
    const [h = "00", m = "00"] = latest.current.split(":")
    const next = part === "hour" ? `${pad(n)}:${m}` : `${h}:${pad(n)}`
    latest.current = next
    onChange(next)
  }

  return (
    <WheelPickerWrapper className="relative w-full min-w-0 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-md bg-zinc-100"
        style={{ height: ITEM_HEIGHT }}
      />
      <span className="sr-only" aria-live="polite">
        {`${label} ${hour}시 ${minute}분`}
      </span>
      <div role="group" aria-label={`${label} 시`} className="flex flex-1">
        <WheelPicker
          options={HOUR_OPTIONS}
          value={hour}
          onValueChange={(h) => change("hour", h)}
          infinite
          visibleCount={16}
          optionItemHeight={ITEM_HEIGHT}
          classNames={WHEEL_CLASS_NAMES}
        />
      </div>
      <span aria-hidden className="relative self-center text-lg font-semibold">
        :
      </span>
      <div role="group" aria-label={`${label} 분`} className="flex flex-1">
        <WheelPicker
          options={minutes}
          value={minute}
          onValueChange={(m) => change("minute", m)}
          visibleCount={16}
          optionItemHeight={ITEM_HEIGHT}
          classNames={WHEEL_CLASS_NAMES}
        />
      </div>
    </WheelPickerWrapper>
  )
}
