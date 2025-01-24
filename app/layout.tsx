import "@/app/globals.css"

import { Metadata } from "next"
import { Inter, Noto_Sans_KR } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import React from "react"

import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const noto_sans_kr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr"
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
        <body className={cn(inter.className, noto_sans_kr.className, "bg-neutral-50")}>
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  )
}
