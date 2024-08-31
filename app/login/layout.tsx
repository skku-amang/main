import '@/app/globals.css'

import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import { FooterInner } from '@/components/common/Footer'
import { HeaderInner } from '@/components/common/Header'
import { cn } from '@/lib/utils'

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
  const headerHeight = '4rem'
  const footerHeight = '4rem'

  return (
    <html lang="ko">
      <SessionProvider>
        <body
          className={cn(fontSans, 'flex h-screen w-screen flex-col bg-gray-300')}
        >
          <HeaderInner  height={headerHeight} />
            <div className="flex w-full flex-grow min-ml-5 mt-5 mb-5 justify-center">{children}</div>
          <FooterInner height={footerHeight} />
        </body>
      </SessionProvider>
    </html>
  )
}
