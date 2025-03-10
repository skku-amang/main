import React from "react"

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerHeightPixel = 82
  const footerHeightPixel = 120
  const paddingBottom = 600

  return (
    <div className="h-screen">
      <Header position="fixed" height={`${headerHeightPixel}px`} mode="dark" />

      <div
        className="h-auto min-h-full pt-[100px]"
        // style={{
        //   paddingBottom: `${footerHeightPixel + paddingBottom}px`
        // }}
      >
        {children}
      </div>

      <Footer height={`${footerHeightPixel}px`} />
    </div>
  )
}
