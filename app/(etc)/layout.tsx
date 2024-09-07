import '@/app/globals.css'

import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import HeightPopulatedBody from '../../components/HeightPopulatedBody'

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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <SessionProvider>
        <HeightPopulatedBody
          headerHeight="4rem"
          footerHeight="5rem"
          className={fontSans.className}
        >
          <div className="container">{children}</div>
        </HeightPopulatedBody>
      </SessionProvider>
    </html>
  )
}
