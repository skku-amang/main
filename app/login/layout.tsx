import '@/app/globals.css'

import React from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerHeight = '82px'
  const footerHeight = '120px'

  return (
    <div className="h-screen">
      <Header position="fixed" height={headerHeight} />

      <div
        className="h-full"
        style={{
          paddingTop: headerHeight,
          paddingBottom: footerHeight
        }}
      >
        {children}
      </div>
      <Footer height={footerHeight}/>
    </div>
  )
}
