"use client"

import { Analytics } from "@vercel/analytics/react"

import { useAuth } from "@/lib/providers/auth-provider"

const developerEmails = new Set(
  (process.env.NEXT_PUBLIC_DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
)

export default function VercelAnalytics() {
  const { user } = useAuth()

  return (
    <Analytics
      beforeSend={(event) => {
        if (user?.email && developerEmails.has(user.email)) {
          return null
        }
        return event
      }}
    />
  )
}
