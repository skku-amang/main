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
  const mobileHeaderHeightPixel = 40
  const desktopHeaderHeightPixel = 82
  const footerHeightPixel = 120

  const toPixelString = (value: number) => `${value}px`

  return (
    <div className="h-screen">
      <Header
        position="fixed"
        height={toPixelString(desktopHeaderHeightPixel)}
        mobileHeight={toPixelString(mobileHeaderHeightPixel)}
        mode={headerMode}
      />

      <main
        className={cn("h-auto min-h-full", mainClassName)}
        style={
          {
            ["--pt-mobile" as string]: toPixelString(
              mobileHeaderHeightPixel + paddingTopPixel
            ),
            ["--pt-desktop" as string]: toPixelString(
              desktopHeaderHeightPixel + paddingTopPixel
            ),
            paddingTop: `var(--pt-mobile)`,
            paddingBottom: toPixelString(
              footerHeightPixel + paddingBottomPixel
            ),
            ...mainStyle
          } as React.CSSProperties
        }
      >
        <style>{`@media (min-width: 768px) { [style*="--pt-mobile"] { padding-top: var(--pt-desktop) !important; } }`}</style>
        {children}
      </main>

      <Footer height={toPixelString(footerHeightPixel)} />
    </div>
  )
}

export default RootHeaderAndFooterWrapper
