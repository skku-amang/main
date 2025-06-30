import React from "react"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { cn } from "@/lib/utils"

type RootHeaderAndFooterWrapperProps = BaseProps & HeaderProps

type BaseProps = {
  children: React.ReactNode
  mainStyle?: React.CSSProperties
  mainClassName?: string
  paddingTopPixel?: number
  paddingBottomPixel?: number
  useHeader?: true
}

export type HeaderMode = "light" | "dark" | "transparent"
type HeaderProps =
  | {
      useHeader?: true
      headerMode?: HeaderMode
      headerHeightPixel?: number
    }
  | {
      useHeader?: false
      headerMode?: undefined
      headerHeightPixel?: undefined
    }

const RootHeaderAndFooterWrapper = ({
  children,
  mainStyle,
  mainClassName = "container",
  paddingTopPixel = 0,
  paddingBottomPixel = 0,
  useHeader = true,
  headerMode = useHeader ? "light" : undefined
}: RootHeaderAndFooterWrapperProps) => {
  const headerHeightPiexel = 48
  const footerHeightPiexl = 120

  const toPixelString = (value: number) => `${value}px`

  return (
    <div className="h-screen">
      <Header
        position="fixed"
        height={toPixelString(headerHeightPiexel)}
        mode={headerMode}
      />

      <main
        className={cn("h-auto min-h-full", mainClassName)}
        style={{
          paddingTop: toPixelString(headerHeightPiexel + paddingTopPixel),
          paddingBottom: toPixelString(footerHeightPiexl + paddingBottomPixel),
          ...mainStyle
        }}
      >
        {children}
      </main>

      <Footer height={toPixelString(footerHeightPiexl)} />
    </div>
  )
}

export default RootHeaderAndFooterWrapper
