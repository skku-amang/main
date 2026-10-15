/**
 * 브라우저 Web Push 유틸. 서버 등록(API 호출)은 호출하는 쪽 몫.
 */
export type PushSupport =
  | "unsupported"
  | "in-app-browser"
  | "ios-not-installed"
  | "denied"
  | "granted"
  | "default"

const IN_APP_BROWSER = /KAKAOTALK|Instagram|FBAN|FBAV|Line\//i

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported"
  const ua = navigator.userAgent
  if (IN_APP_BROWSER.test(ua)) return "in-app-browser"

  const isIos = /iPhone|iPad|iPod/.test(ua)
  const installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (isIos && !installed) return "ios-not-installed"

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  )
    return "unsupported"

  return Notification.permission
}

/** 정적 sw.js는 env를 모르므로 API 주소와 VAPID 공개키를 쿼리로 넘긴다 */
export function registerServiceWorker(apiUrl: string, vapidPublicKey: string) {
  const query = new URLSearchParams({ api: apiUrl, vapid: vapidPublicKey })
  return navigator.serviceWorker.register(`/sw.js?${query}`)
}

export async function getBrowserSubscription() {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

/** 권한이 granted인 상태에서 호출. 이미 구독돼 있으면 그대로 돌려준다 */
export async function subscribeBrowser(vapidPublicKey: string) {
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  })
}

/** 서버 DTO 형태로. 브라우저가 keys를 안 주는 경우는 스펙상 없지만 타입이 optional이라 좁힌다 */
export function toSubscriptionDto(subscription: PushSubscription) {
  const json = subscription.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!json.endpoint || !p256dh || !auth)
    throw new Error("푸시 구독에 endpoint 또는 키가 없습니다")
  return { endpoint: json.endpoint, keys: { p256dh, auth } }
}

/** 구독이 지금 공개키로 만들어졌는지. 키를 교체하면 옛 구독은 FCM이 403으로 영구 거부하므로 다시 만들어야 한다 */
export function isSubscribedWithKey(
  subscription: PushSubscription,
  vapidPublicKey: string
) {
  const key = subscription.options.applicationServerKey
  if (!key) return true
  const current = urlBase64ToUint8Array(vapidPublicKey)
  const existing = new Uint8Array(key)
  return (
    existing.length === current.length &&
    existing.every((byte, i) => byte === current[i])
  )
}

/** 이 브라우저 구독을 서버와 브라우저 양쪽에서 푼다. 구독이 없거나 실패해도 조용히 끝난다 */
export async function removePushSubscription(apiClient: {
  deletePushSubscription: (body: { endpoint: string }) => Promise<unknown>
}) {
  try {
    if (!("serviceWorker" in navigator)) return
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (!subscription) return
    await apiClient.deletePushSubscription({ endpoint: subscription.endpoint })
    await subscription.unsubscribe()
    sessionStorage.removeItem("push-subscription-ensured")
  } catch {
    // best-effort
  }
}

export function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}
