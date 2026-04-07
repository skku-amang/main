"use client"

import { Analytics } from "@vercel/analytics/react"
import { useSession } from "next-auth/react"

const developerEmails = new Set(
  (process.env.NEXT_PUBLIC_DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
)

export default function VercelAnalytics() {
  const { data: session } = useSession()

  return (
    <Analytics
      beforeSend={(event) => {
        if (session?.user?.email && developerEmails.has(session.user.email)) {
          return null
        }
        return event
      }}
    />
  )
}
