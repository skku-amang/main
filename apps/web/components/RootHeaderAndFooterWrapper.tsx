import React from "react"

import BottomTabBar from "@/components/BottomTabBar"
import SuggestionButton from "@/components/SuggestionButton"
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
    // h-screen(100vh)은 모바일 주소창이 접힌 높이 기준이라, 주소창이 보일 땐 그만큼 스크롤이 생김
    <div className="h-dvh">
      <Header position="fixed" mode={headerMode} />

      <main
        className={cn(
          "h-auto min-h-full pt-[calc(var(--header-height)+var(--extra-pt))]",
          // Footer는 md부터 보이므로 그 자리도 md부터만 비움
          "pb-[calc(var(--extra-pb)+var(--tabbar-height))] md:pb-[calc(var(--footer-height)+var(--extra-pb)+var(--tabbar-height))]",
          mainClassName
        )}
        style={
          {
            "--extra-pt": toPixelString(paddingTopPixel),
            "--extra-pb": toPixelString(paddingBottomPixel),
            "--footer-height": toPixelString(footerHeightPixel),
            ...mainStyle
          } as React.CSSProperties
        }
      >
        {children}
      </main>

      <Footer height={toPixelString(footerHeightPixel)} />
      {useHeader && <BottomTabBar />}
      <SuggestionButton />
    </div>
  )
}

export default RootHeaderAndFooterWrapper
