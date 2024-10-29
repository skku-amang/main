import { Oleo_Script } from "next/font/google"
import React from "react"

import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

interface LetterProps {
  word: {
    id: number
    modifiedWord: string
  }
  textSize?: string // 텍스트 크기를 받아오는 props 추가
}

const PageHeaderLetters: React.FC<LetterProps> = ({ word, textSize }) => {
  return (
    <div
      className={cn(
        OleoScript.className,
        "z-0 bg-primary italic text-primary",
        textSize // 동적으로 텍스트 크기 적용
      )}
      style={{
        WebkitTextStroke: "2px white" // -webkit-text-stroke 속성 적용
      }}
    >
      {word.modifiedWord}
    </div>
  )
}

export default PageHeaderLetters
