"use client"

import * as Sentry from "@sentry/nextjs"
import { MessageSquareText } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useState } from "react"

import ROUTES from "@/constants/routes"
import { ClampFn, useDraggable } from "@/hooks/useDraggable"

const STORAGE_KEY = "amang:suggestion-button-position"
const EDGE = 8

// 화면에 보이는 요소의 위/아래 끝 (숨겨진 요소는 null)
const visibleRect = (el: Element | null) => {
  const rect = el?.getBoundingClientRect()
  return rect && rect.height > 0 ? rect : null
}

// 버튼 전체가 헤더 아래, 하단 탭바·고정 CTA(예약하기 등) 위에 있도록
const clampBetweenFixedBars: ClampFn = (pos, { width, height }) => {
  const header = visibleRect(document.querySelector("header"))
  const bottoms = [
    visibleRect(document.querySelector('nav[aria-label="주요 메뉴"]')),
    ...[...document.querySelectorAll("[data-floating-cta]")].map(visibleRect)
  ]
    .filter((rect) => rect !== null)
    .map((rect) => rect.top)
  const topLimit = (header?.bottom ?? 0) + EDGE
  const bottomLimit = Math.min(window.innerHeight, ...bottoms) - EDGE
  return {
    x: Math.min(Math.max(pos.x, EDGE), window.innerWidth - width - EDGE),
    y: Math.min(Math.max(pos.y, topLimit), bottomLimit - height)
  }
}

const readSavedPosition = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { x: number; y: number }) : null
  } catch {
    return null
  }
}

const savePosition = (pos: { x: number; y: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
  } catch {
    // 저장 못 해도 이번 방문 동안은 옮긴 자리에 있음
  }
}

type FeedbackForm = Awaited<
  ReturnType<NonNullable<ReturnType<typeof Sentry.getFeedback>>["createForm"]>
>

// 어디서든 바로 의견(버그·건의·칭찬)을 보내는 떠 있는 버튼. Sentry 기본 폼을 연다
const SuggestionButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  // 의견 보내기 페이지 안에선 같은 기능이라 중복
  const hidden = pathname.startsWith(ROUTES.SUGGESTIONS)
  const [savedPosition] = useState(readSavedPosition)
  const { ref, position, initialized, wasDragged, handlers } =
    useDraggable<HTMLButtonElement>({
      enabled: !hidden,
      clamp: clampBetweenFixedBars,
      initialPosition: savedPosition,
      onDragEnd: savePosition,
      reclampKey: pathname
    })
  const form = useRef<FeedbackForm | null>(null)

  if (hidden) return null

  const openForm = async () => {
    if (wasDragged()) return

    // Sentry가 꺼진 환경(로컬 개발 등)에선 위젯이 없음 → 의견 보내기 페이지로
    const feedback = Sentry.getFeedback()
    if (!feedback) {
      router.push(ROUTES.SUGGESTIONS)
      return
    }
    if (!form.current) {
      // 기본 동작은 '고마워요' 안내가 떠 있는 5초 동안 페이지 스크롤을 막아둠
      form.current = await feedback.createForm({
        onSubmitSuccess: () => form.current?.close()
      })
      form.current.appendToDom()
    }
    form.current.open()
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="의견 보내기"
      title="의견 보내기 (끌어서 옮길 수 있어요)"
      onClick={openForm}
      {...handlers}
      className="fixed z-40 flex size-11 touch-none items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-200 transition-colors hover:text-primary active:cursor-grabbing"
      style={
        initialized
          ? { left: position.x, top: position.y }
          : {
              right: 16,
              bottom: "calc(var(--tabbar-height) + 16px)",
              visibility: "hidden"
            }
      }
    >
      <MessageSquareText className="size-5" />
    </button>
  )
}

export default SuggestionButton
