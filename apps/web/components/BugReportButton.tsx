"use client"

import * as Sentry from "@sentry/nextjs"
import { Bug } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import ROUTES from "@/constants/routes"
import { ClampFn, useDraggable } from "@/hooks/useDraggable"

const STORAGE_KEY = "amang:bug-report-button-position"
const EDGE = 8

// 버튼 전체가 화면 안, 하단 탭바 위에 있도록
const clampAboveTabBar: ClampFn = (pos, { width, height }) => {
  const tabBar = document.querySelector<HTMLElement>(
    'nav[aria-label="주요 메뉴"]'
  )
  const bottomLimit = window.innerHeight - (tabBar?.offsetHeight ?? 0) - EDGE
  return {
    x: Math.min(Math.max(pos.x, EDGE), window.innerWidth - width - EDGE),
    y: Math.min(Math.max(pos.y, EDGE), bottomLimit - height)
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

const BugReportButton = () => {
  const router = useRouter()
  const [savedPosition] = useState(readSavedPosition)
  const { ref, position, initialized, wasDragged, handlers } =
    useDraggable<HTMLButtonElement>({
      clamp: clampAboveTabBar,
      initialPosition: savedPosition,
      onDragEnd: savePosition
    })
  const form = useRef<FeedbackForm | null>(null)

  const openForm = async () => {
    if (wasDragged()) return

    // Sentry가 꺼진 환경(로컬 개발 등)에선 위젯이 없음 → 의견 보내기 페이지로
    const feedback = Sentry.getFeedback()
    if (!feedback) {
      router.push(ROUTES.SUGGESTIONS)
      return
    }
    if (!form.current) {
      form.current = await feedback.createForm()
      form.current.appendToDom()
    }
    form.current.open()
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="버그 제보"
      title="버그 제보 (끌어서 옮길 수 있어요)"
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
      <Bug className="size-5" />
    </button>
  )
}

export default BugReportButton
