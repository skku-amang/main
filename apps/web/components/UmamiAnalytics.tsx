"use client"

import Script from "next/script"
import { useEffect } from "react"

import { useAuth } from "@/lib/providers/auth-provider"

type UmamiBeforeSend = (type: string, payload: unknown) => Promise<unknown>

declare global {
  interface Window {
    umamiBeforeSend?: UmamiBeforeSend
  }
}

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

// 이메일 원문 대신 SHA-256 해시만 번들에 넣는다
const developerEmailHashes = new Set(
  (process.env.NEXT_PUBLIC_DEVELOPER_EMAIL_HASHES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
)

async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
}

export default function UmamiAnalytics() {
  const { user, isLoading } = useAuth()
  const email = user?.email

  useEffect(() => {
    window.umamiBeforeSend = async (_type, payload) => {
      // AI·테스트 도구가 조종하는 브라우저(Chrome DevTools MCP, Playwright 등)는 이 값이 true
      if (navigator.webdriver) return null
      if (
        email &&
        developerEmailHashes.has(await sha256(email.trim().toLowerCase()))
      )
        return null
      return payload
    }
  }, [email])

  // 로그인 확인 전에 첫 페이지뷰가 나가면 개발자 방문이 섞인다
  if (!websiteId || !siteUrl || isLoading) return null

  return (
    <Script
      src="https://analytics.amang.json-server.win/script.js"
      data-website-id={websiteId}
      // 로컬·Vercel 미리보기 주소에서는 기록하지 않는다
      data-domains={new URL(siteUrl).hostname}
      data-before-send="umamiBeforeSend"
      strategy="afterInteractive"
    />
  )
}
