import { Oleo_Script } from "next/font/google"
import React from "react"

import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

interface FirstLetterProps {
  word: {
    id: number
    letter: string
  }
  textSize?: string // 텍스트 크기를 받아오는 props 추가
}

const OleoPageHeaderFirstLetters: React.FC<FirstLetterProps> = ({
  word,
  textSize
}) => {
  return (
    <div
      className={cn(
        OleoScript.className,
        textSize, // 동적으로 텍스트 크기 적용
        "z-10 bg-primary italic text-gray-100"
      )}
    >
      {word.letter} {/* 첫 글자를 표시 */}
    </div>
  )
}

export default OleoPageHeaderFirstLetters
