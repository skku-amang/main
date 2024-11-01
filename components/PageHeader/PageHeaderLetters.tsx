import { Oleo_Script } from "next/font/google"
import React from "react"

import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

interface LetterProps {
  word: {
    id: number
    modifiedWord: string
  }
  textSize?: string
}

const PageHeaderLetters: React.FC<LetterProps> = ({ word, textSize }) => {
  return (
    <div
      className={cn(
        OleoScript.className,
        "z-0 bg-primary italic text-primary",
        textSize
      )}
      style={{
        WebkitTextStroke: "2px white"
      }}
    >
      {word.modifiedWord}
    </div>
  )
}

export default PageHeaderLetters
