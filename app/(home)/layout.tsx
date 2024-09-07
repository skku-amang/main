import '@/app/globals.css'

import React from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

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
        className="h-auto"
        style={{
          backgroundImage: `url('Music band_pixabay 1.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          minHeight: '100%',
          paddingTop: headerHeight,
          paddingBottom: footerHeight
        }}
      >
        {children}
      </div>

      <Footer height={footerHeight} />
    </div>
  )
}
