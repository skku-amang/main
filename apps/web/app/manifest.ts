import type { MetadataRoute } from "next"

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
    start_url: "/",
    display: "standalone",
    lang: "ko",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }
}
