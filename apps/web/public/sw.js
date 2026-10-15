/* AMANG Web Push service worker.
 * 푸시 수신·클릭·구독 갱신만 담당한다. 오프라인 캐싱 없음 (ADR-0003 원칙5).
 * 등록 시 ?api=<API URL>&vapid=<public key>를 붙여 받는다 (정적 파일이라 env를 모름).
 */
const params = new URL(self.location.href).searchParams
const API_URL = params.get("api") || ""
const VAPID_PUBLIC_KEY = params.get("vapid") || ""

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
)

self.addEventListener("push", (event) => {
  let data = {
    title: "AMANG",
    body: "새 알림이 있어요",
    href: "/notifications"
  }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    // 본문이 JSON이 아니면 기본 문구
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { href: data.href }
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const href =
    (event.notification.data && event.notification.data.href) ||
    "/notifications"
  const url = new URL(href, self.location.origin).href
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) =>
          c.url.startsWith(self.location.origin)
        )
        if (existing && "navigate" in existing)
          return existing.focus().then(() => existing.navigate(url))
        return self.clients.openWindow(url)
      })
  )
})

// 브라우저가 구독을 갈아끼우면(키 만료 등) 새 구독을 서버에 다시 등록
self.addEventListener("pushsubscriptionchange", (event) => {
  const options = (event.oldSubscription && event.oldSubscription.options) || {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  }
  event.waitUntil(
    self.registration.pushManager.subscribe(options).then((subscription) =>
      fetch(`${API_URL}/push/subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON())
      })
    )
  )
})

function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}
