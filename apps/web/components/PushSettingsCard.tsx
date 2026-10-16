"use client"

import { BellOff, BellRing } from "lucide-react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { usePushSubscription } from "@/hooks/usePushSubscription"

const LABEL: Record<string, string> = {
  unsupported: "이 브라우저는 푸시 알림을 지원하지 않아요",
  "in-app-browser":
    "카카오톡 등 앱 안 브라우저에서는 켤 수 없어요. Safari·Chrome으로 열어주세요",
  "ios-not-installed": "아이폰은 홈 화면에 추가한 뒤 그 앱에서 켤 수 있어요",
  denied:
    "브라우저에서 알림이 차단됐어요. 브라우저 설정에서 허용한 뒤 다시 켜주세요"
}

/** 프로필 > 로그인 기기·알림 설정: 이 기기의 푸시 알림 켜기/끄기 */
const PushSettingsCard = () => {
  const { support, subscribed, enable, disable, isPending } =
    usePushSubscription()
  const { toast } = useToast()

  if (support === null) return null

  const on = support === "granted" && subscribed === true
  const canToggle = support === "granted" || support === "default"

  const toggle = async () => {
    try {
      if (on) {
        await disable()
        toast({ title: "이 기기의 푸시 알림을 껐어요" })
      } else {
        const ok = await enable()
        toast({
          title: ok ? "이 기기의 푸시 알림을 켰어요" : "알림이 차단됐어요",
          description: ok
            ? undefined
            : "브라우저 설정에서 다시 허용할 수 있어요."
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "설정을 바꾸지 못했어요. 다시 시도해주세요."
      })
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-x-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-x-3">
        {on ? (
          <BellRing className="size-5 shrink-0 text-primary" />
        ) : (
          <BellOff className="size-5 shrink-0 text-slate-400" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold">이 기기 푸시 알림</p>
          <p className="text-xs text-slate-500">
            {canToggle ? (on ? "켜짐" : "꺼짐") : LABEL[support]}
          </p>
        </div>
      </div>
      {canToggle && (
        <Button
          size="sm"
          variant={on ? "outline" : "default"}
          className="shrink-0 rounded-full"
          onClick={toggle}
          disabled={isPending}
        >
          {on ? "끄기" : "켜기"}
        </Button>
      )}
    </div>
  )
}

export default PushSettingsCard
