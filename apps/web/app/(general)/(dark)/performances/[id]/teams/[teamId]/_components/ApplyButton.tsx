/* eslint-disable no-unused-vars */
"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import SESSIONIMAGE from "@/constants/sessionimage"
import { cn } from "@/lib/utils"
import { SessionName } from "shared-types"

interface ApplyButtonProps {
  session: SessionName
  memberSessionIndex: number
  selectedSessionsWithIndex: string[]
  toggleSelectedSessionWithIndex: (memberSessionWithWithIndex: string) => void
}

const ApplyButton = ({
  session,
  memberSessionIndex,
  selectedSessionsWithIndex,
  toggleSelectedSessionWithIndex
}: ApplyButtonProps) => {
  const memberSessionWithIndex = `${session}__${memberSessionIndex}`
  const isSelected = selectedSessionsWithIndex.includes(memberSessionWithIndex)

  const [isLargeScreen, setIsLargeScreen] = useState(false) // 768px 이상
  const [isMediumScreen, setIsMediumScreen] = useState(false) // 410px 이상
  const [isSmallScreen, setIsSmallScreen] = useState(false) // 410px 이하

  // TODO: 반응형은 js로 구현하지 말고 css로 구현해야 함(TailwindCSS로 변경 필요)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsLargeScreen(width >= 768)
      setIsMediumScreen(width >= 470 && width < 768)
      setIsSmallScreen(width < 470)
    }

    // Resize 이벤트 리스너 추가
    window.addEventListener("resize", handleResize)

    // 초기 화면 크기 체크
    handleResize()

    // cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <button
      className="relative h-full w-full"
      onClick={() => toggleSelectedSessionWithIndex(memberSessionWithIndex)}
    >
      <div
        className={cn(
          "relative flex h-[100px] w-full items-center overflow-hidden rounded bg-slate-50 max-[470px]:h-[60px] md:h-[160px] md:w-[250px] md:overflow-visible",
          isSelected ? "border-4 border-primary" : ""
        )}
        style={{
          borderRadius: "5px"
        }}
      >
        <Image
          src={
            isSelected
              ? SESSIONIMAGE.PRESSED[session]
              : SESSIONIMAGE.UNPRESSED[session]
          }
          alt={`${session} session image`}
          className="absolute left-0 top-0"
          // 화면 크기에 따라 width와 height 설정
          width={
            isLargeScreen
              ? undefined
              : isMediumScreen
                ? 125
                : isSmallScreen
                  ? 80
                  : 80
          }
          height={
            isLargeScreen
              ? undefined
              : isMediumScreen
                ? 125
                : isSmallScreen
                  ? 80
                  : 80
          }
          fill={isLargeScreen}
        />
        {/* 세션명 */}
        <div className="absolute right-[8px] z-10 text-center text-sm font-semibold text-slate-600 md:right-[16px] md:text-2xl">
          {session}
          {memberSessionIndex}
        </div>
      </div>
      <div
        className={cn(
          "absolute -right-2 -top-2 ml-1 h-5 w-5 items-center justify-center rounded-full bg-primary text-white md:-right-4 md:-top-4 md:h-8 md:w-8",
          isSelected ? "block overflow-visible opacity-100" : "hidden"
        )}
      >
        <Check className="h-[20px] w-[20px] pb-[1px] pt-[3px] md:h-[32px] md:w-[32px]" />
      </div>
    </button>
  )
}

export default ApplyButton
