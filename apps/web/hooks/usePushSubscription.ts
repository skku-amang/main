"use client"

import { useCallback, useEffect, useState } from "react"

import {
  useCreatePushSubscription,
  useDeletePushSubscription
} from "@/hooks/api/usePush"
import {
  getBrowserSubscription,
  getPushSupport,
  isSubscribedWithKey,
  PushSupport,
  registerServiceWorker,
  setPushOptOut,
  subscribeBrowser,
  toSubscriptionDto
} from "@/lib/push"
import { useAuth } from "@/lib/providers/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
const ENSURED_KEY = "push-subscription-ensured"

/**
 * 이 기기의 푸시 상태와 켜기/끄기. 로그인 상태에서 SW를 등록하고,
 * 이미 허용된 기기는 세션당 한 번 서버에 구독을 다시 등록한다 (서버가 410으로 지운 구독 복구).
 */
export function usePushSubscription() {
  const { user } = useAuth()
  const [support, setSupport] = useState<PushSupport | null>(null)
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const createSubscription = useCreatePushSubscription()
  const deleteSubscription = useDeletePushSubscription()

  const configured = VAPID_PUBLIC_KEY.length > 0

  useEffect(() => {
    if (!user || !configured) return
    const current = getPushSupport()
    setSupport(current)
    if (current !== "granted" && current !== "default") return

    let cancelled = false
    ;(async () => {
      let existing: PushSubscription | null
      try {
        await registerServiceWorker(API_URL, VAPID_PUBLIC_KEY)
        existing = await getBrowserSubscription()
      } catch {
        // SW 등록 자체가 안 되는 브라우저
        if (!cancelled) setSupport("unsupported")
        return
      }
      if (cancelled) return

      try {
        // 공개키가 바뀐 뒤 남은 옛 구독은 영구 실패 — 권한이 있으니 조용히 새로 만든다
        if (existing && !isSubscribedWithKey(existing, VAPID_PUBLIC_KEY)) {
          await existing.unsubscribe()
          existing = await subscribeBrowser(VAPID_PUBLIC_KEY)
          sessionStorage.removeItem(ENSURED_KEY)
        }
        if (cancelled) return
        setSubscribed(existing !== null)
        if (existing && !sessionStorage.getItem(ENSURED_KEY)) {
          await createSubscription.mutateAsync([toSubscriptionDto(existing)])
          sessionStorage.setItem(ENSURED_KEY, "1")
        }
      } catch {
        // 서버 등록 실패(일시 장애·세션 만료)는 다음 세션에 재시도. 브라우저 상태 판정은 유지
      }
    })()
    return () => {
      cancelled = true
    }
    // createSubscription은 매 렌더 새 객체 — mount 시 1회면 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, configured])

  /** 사용자 제스처 안에서 호출해야 브라우저 권한 프롬프트가 뜬다 */
  const enable = useCallback(async () => {
    const permission = await Notification.requestPermission()
    setSupport(permission)
    if (permission !== "granted") return false
    const subscription = await subscribeBrowser(VAPID_PUBLIC_KEY)
    await createSubscription.mutateAsync([toSubscriptionDto(subscription)])
    sessionStorage.setItem(ENSURED_KEY, "1")
    setPushOptOut(false)
    setSubscribed(true)
    return true
  }, [createSubscription])

  const disable = useCallback(async () => {
    setPushOptOut(true)
    const subscription = await getBrowserSubscription()
    if (!subscription) {
      setSubscribed(false)
      return
    }
    try {
      await deleteSubscription.mutateAsync([
        { endpoint: subscription.endpoint }
      ])
    } finally {
      // 서버 해제가 실패해도 브라우저 구독은 푼다 — 서버 row는 다음 발송의 410으로 정리됨
      await subscription.unsubscribe()
      sessionStorage.removeItem(ENSURED_KEY)
      setSubscribed(false)
    }
  }, [deleteSubscription])

  return {
    /** null = 아직 판정 전(SSR·첫 렌더) 또는 공개키 미설정(푸시 UI 전체 숨김) */
    support: configured ? support : null,
    subscribed,
    enable,
    disable,
    isPending: createSubscription.isPending || deleteSubscription.isPending
  }
}
