import type { MetadataRoute } from "next"

import ROUTES from "@/constants/routes"
import { SEO } from "@/constants/seo"

/**
 * 홈 화면에 추가(iOS)용 최소 manifest. iOS는 standalone 웹앱에서만 Web Push를 허용한다 (ADR-0003).
 * 오프라인 캐싱은 하지 않는다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO.SITE_NAME,
    short_name: "AMANG",
    description: SEO.SITE_DESCRIPTION,
    // id를 고정해 두면 start_url을 바꿔도 같은 앱으로 인식된다
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "ko",
    background_color: "#ffffff",
    theme_color: SEO.THEME_COLOR,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    // 홈 화면 아이콘 길게 누르기 메뉴
    shortcuts: [
      { name: "알림", url: ROUTES.NOTIFICATIONS },
      { name: "공연 목록", url: ROUTES.PERFORMANCE.LIST },
      { name: "동방 예약", url: ROUTES.RESERVATION.CLUBROOM }
    ]
  }
}
