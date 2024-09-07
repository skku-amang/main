import '@/app/globals.css'

import { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})
export const metadata: Metadata = {
  title: 'AMANG',
  description: 'SKKU AMANG official homepage',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <SessionProvider>
        <body className={fontSans.className}>{children}</body>
      </SessionProvider>
    </html>
  )
}
