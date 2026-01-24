"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { slides as SLIDES } from "./_components/_slides"

type Slide = {
  key: string
  title: string
  content: React.ReactNode
}

export default function TestPage() {
  const slides: Slide[] = SLIDES

  const [activeIndex, setActiveIndex] = React.useState(0)
  const trackRef = React.useRef<HTMLDivElement | null>(null)

  const goTo = React.useCallback(
    (idx: number) => {
      const el = trackRef.current
      if (!el) return
      const clamped = Math.max(0, Math.min(slides.length - 1, idx))
      setActiveIndex(clamped)
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" })
    },
    [slides.length]
  )

  React.useEffect(() => {
    const onResize = () => goTo(activeIndex)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [activeIndex, goTo])

  React.useEffect(() => {
    const el = trackRef.current
    if (!el) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1
        const idx = Math.round(el.scrollLeft / w)
        if (idx !== activeIndex) setActiveIndex(idx)
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll)
    }
  }, [activeIndex])

  const value = slides[activeIndex]?.key ?? slides[0]?.key

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">UI 테스트 페이지</h1>
          <p className="text-sm text-muted-foreground">
            좌우로 넘기면서 컴포넌트를 단위별로 테스트합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Tabs
        value={value}
        onValueChange={(next) => {
          const idx = slides.findIndex((s) => s.key === next)
          if (idx >= 0) goTo(idx)
        }}
      >
        <TabsList className="flex w-full justify-start overflow-x-auto">
          {slides.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="shrink-0">
              {s.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div
        ref={trackRef}
        className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-xl border bg-muted/20"
      >
        <div className="flex w-full">
          {slides.map((s) => (
            <div
              key={s.key}
              className="w-full shrink-0 snap-start p-6"
              style={{ minWidth: "100%" }}
            >
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
