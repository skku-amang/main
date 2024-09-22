import '@/app/globals.css'

import React from 'react'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerHeight = '4rem'
  const footerHeight = '5rem'

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
