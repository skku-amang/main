"use client"

import { BellRing, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { usePushSubscription } from "@/hooks/usePushSubscription"
import { isPushOptedOut } from "@/lib/push"

const SNOOZE_KEY = "push-soft-ask-snoozed-until"
const SNOOZE_DAYS = 7

const readSnoozed = () => {
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0)
    return until > Date.now()
  } catch {
    return false
  }
}

const snooze = () => {
  try {
    localStorage.setItem(
      SNOOZE_KEY,
      String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
    )
  } catch {
    // 저장 불가 환경(시크릿 등)이면 이번 세션만 닫힘
  }
}

/**
 * 브라우저 권한 프롬프트를 바로 띄우지 않고 먼저 묻는 배너 (ADR-0003 원칙2).
 * iOS 미설치·인앱 브라우저는 권한 요청 자체가 불가능하므로 안내만 한다.
 * 직접 끈 기기(opt-out)와 설정 카드가 있는 기기 페이지에서는 띄우지 않는다.
 */
const PushSoftAsk = () => {
  const pathname = usePathname()
  const { support, subscribed, enable, isPending } = usePushSubscription()
  const { toast } = useToast()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(readSnoozed() || isPushOptedOut())
  }, [])

  if (pathname === ROUTES.PROFILE.DEVICES) return null
  if (dismissed || support === null) return null
  if (support === "unsupported" || support === "denied") return null
  if (support === "granted" && subscribed !== false) return null

  const close = () => {
    snooze()
    setDismissed(true)
  }

  const onEnable = async () => {
    try {
      const ok = await enable()
      if (ok)
        toast({
          title: "알림을 켰어요",
          description: "팀·공연 소식을 이 기기로 보내드릴게요."
        })
      else
        toast({
          title: "알림이 차단됐어요",
          description: "브라우저 설정에서 다시 허용할 수 있어요."
        })
    } catch {
      toast({
        variant: "destructive",
        title: "알림을 켜지 못했어요. 잠시 후 다시 시도해주세요."
      })
    }
    setDismissed(true)
  }

  const content =
    support === "ios-not-installed"
      ? {
          title: "아이폰은 홈 화면에 추가해야 알림을 받을 수 있어요",
          body: "Safari 아래 공유 버튼 → ‘홈 화면에 추가’를 누르고, 추가된 앱에서 열어주세요.",
          action: null
        }
      : support === "in-app-browser"
        ? {
            title: "카카오톡 안에서는 알림을 켤 수 없어요",
            body: "오른쪽 위 메뉴에서 ‘다른 브라우저로 열기’를 눌러주세요.",
            action: null
          }
        : {
            title: "팀·공연 소식을 바로 받아보세요",
            body: "알림을 켜면 팀 합류, 새 공연 같은 소식을 놓치지 않아요.",
            action: "알림 받기"
          }

  return (
    <div
      role="region"
      aria-label="알림 설정 안내"
      className="fixed inset-x-4 bottom-[calc(var(--tabbar-height)+12px)] z-40 mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:inset-x-auto md:bottom-6 md:right-6"
    >
      <div className="flex items-start gap-x-3">
        <BellRing className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{content.title}</p>
          <p className="mt-1 text-sm text-slate-600">{content.body}</p>
          <div className="mt-3 flex gap-x-2">
            {content.action && (
              <Button size="sm" onClick={onEnable} disabled={isPending}>
                {content.action}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={close}>
              {content.action ? "나중에" : "닫기"}
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={close}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default PushSoftAsk
