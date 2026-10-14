import React from "react"

import BottomTabBar from "@/components/BottomTabBar"
import BugReportButton from "@/components/BugReportButton"
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
    }
  | {
      useHeader?: false
      headerMode?: undefined
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
  const footerHeightPixel = 120

  const toPixelString = (value: number) => `${value}px`

  return (
    <div className="h-screen">
      <Header position="fixed" mode={headerMode} />

      <main
        className={cn(
          "h-auto min-h-full pt-[calc(var(--header-height)+var(--extra-pt))]",
          mainClassName
        )}
        style={
          {
            "--extra-pt": toPixelString(paddingTopPixel),
            paddingBottom: `calc(${toPixelString(
              footerHeightPixel + paddingBottomPixel
            )} + var(--tabbar-height))`,
            ...mainStyle
          } as React.CSSProperties
        }
      >
        {children}
      </main>

      <Footer height={toPixelString(footerHeightPixel)} />
      {useHeader && <BottomTabBar />}
      <BugReportButton />
    </div>
  )
}

export default RootHeaderAndFooterWrapper
