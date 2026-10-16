import "@/app/globals.css"

import { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import React from "react"

import { SpeedInsights } from "@vercel/speed-insights/react"

import PushSoftAsk from "@/components/PushSoftAsk"
import { Toaster } from "@/components/ui/toaster"
import UmamiAnalytics from "@/components/UmamiAnalytics"
import VercelAnalytics from "@/components/VercelAnalytics"
import { SEO } from "@/constants/seo"
import Providers from "@/lib/providers"
import { cn } from "@/lib/utils"

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920", // weight 옵션을 지정하지 않으면 WebKit 기반의 브라우저에서 굵기가 잘못 렌더링 될 수 있으니 주의해 주세요.
  variable: "--font-pretendard"
})

export const metadata: Metadata = {
  metadataBase: new URL(SEO.SITE_URL),
  title: {
    default: SEO.SITE_NAME,
    template: "%s | AMANG"
  },
  description: SEO.SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png"
  },
  // iOS "홈 화면에 추가" → standalone 웹앱. Web Push는 이 상태에서만 동작 (ADR-0003)
  appleWebApp: {
    capable: true,
    title: "AMANG",
    statusBarStyle: "default"
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SEO.SITE_URL,
    siteName: SEO.SITE_NAME,
    title: SEO.SITE_NAME,
    description: SEO.SITE_DESCRIPTION,
    images: [
      {
        url: SEO.DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SEO.SITE_NAME
      }
    ]
  },
  twitter: {
    card: "summary_large_image"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  alternates: {
    canonical: SEO.SITE_URL
  }
  // 네이버/구글 인증 코드가 준비되면 아래 주석 해제:
  // verification: {
  //   google: "GOOGLE_VERIFICATION_CODE",
  //   other: { "naver-site-verification": "NAVER_VERIFICATION_CODE" }
  // }
}

// env(safe-area-inset-*)가 0이 아닌 값을 갖게 하려면 cover 필요 (iPhone 홈 인디케이터 영역)
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: SEO.THEME_COLOR
}

/**
 * Root layout 입니다.
 * Session, metadata, font 등 전역적인 설정을 적용합니다.
 * HTML, CSS 등 스타일 절대 적용 금지!
 * 개별 페이지의 레이아웃은 각 페이지에서 구현해주세요.
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={cn(pretendard.className, "bg-neutral-50")}>
        <Providers>
          {children}
          <PushSoftAsk />
          <Toaster />
          <VercelAnalytics />
          <SpeedInsights />
          <UmamiAnalytics />
        </Providers>
      </body>
    </html>
  )
}
