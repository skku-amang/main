"use client"

import { useState } from "react"
import { minuteOptions } from "@repo/shared-types"

import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker"

const pad = (n: number) => String(n).padStart(2, "0")
const toOption = (n: number) => ({ value: n, label: pad(n) })
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => toOption(h))

// 생성된 wheel-picker.tsx는 Tailwind v4 문법(inset-ring 등)이라 v3에서 빠지는 포커스 표시를 여기서 채운다
const WHEEL_CLASS_NAMES = {
  optionItem: "text-base",
  highlightWrapper:
    "text-lg font-semibold data-[rwp-focused]:ring-2 data-[rwp-focused]:ring-inset data-[rwp-focused]:ring-zinc-300"
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

  return (
    <WheelPickerWrapper className="w-40 shadow-sm">
      <div role="group" aria-label={`${label} 시`} className="flex flex-1">
        <WheelPicker
          options={HOUR_OPTIONS}
          value={hour}
          onValueChange={(h) => onChange(`${pad(h)}:${pad(minute)}`)}
          infinite
          visibleCount={16}
          optionItemHeight={36}
          classNames={WHEEL_CLASS_NAMES}
        />
      </div>
      <span aria-hidden className="self-center text-lg font-semibold">
        :
      </span>
      <div role="group" aria-label={`${label} 분`} className="flex flex-1">
        <WheelPicker
          options={minutes}
          value={minute}
          onValueChange={(m) => onChange(`${pad(hour)}:${pad(m)}`)}
          visibleCount={16}
          optionItemHeight={36}
          classNames={WHEEL_CLASS_NAMES}
        />
      </div>
    </WheelPickerWrapper>
  )
}
