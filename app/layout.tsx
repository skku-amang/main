import "@/app/globals.css"

import { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import React from "react"

import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import localFont from "next/font/local"

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920', // weight 옵션을 지정하지 않으면 WebKit 기반의 브라우저에서 굵기가 잘못 렌더링 될 수 있으니 주의해 주세요.
  variable: "--font-pretendard",
})

export const metadata: Metadata = {
  title: "AMANG",
  description: "SKKU AMANG official homepage",
  icons: {
    icon: "/favicon.ico"
  }
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
      <SessionProvider>
        <body className={cn(pretendard.className, "bg-neutral-50")}>
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  )
}
