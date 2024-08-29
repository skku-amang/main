import '@/app/globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import HeightPopulatedBody from '../../components/common/HeightPopulatedBody'
import { cn } from '../../lib/utils'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <SessionProvider>
        <HeightPopulatedBody
          headerHeight="4rem"
          footerHeight="5rem"
          className={cn(inter.className, 'overflow-hidden')}
          style={{
            backgroundImage: `url('Music band_pixabay 1.png')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="container">{children}</div>
        </HeightPopulatedBody>
      </SessionProvider>
    </html>
  )
}
