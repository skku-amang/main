import { Oleo_Script } from "next/font/google"
import React from "react"

import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

const OleoPageHeader = ({
  title
}: {
  title: string
}) => {
  const words = title.split(" ")

  return (
    <div className="flex mb-10">
      {words.map((word, i) => {
        const firstLetter = word.charAt(0)
        const rest = word.slice(1)

        return (
        <div className="flex" key={i}>
          <div className={cn(
            OleoScript.className,
            "italic text-gray-100 text-9xl"
          )}>
            {firstLetter}
          </div>
          <div className={cn(
            OleoScript.className,
            "italic text-primary text-9xl"
          )}
          style={{
            WebkitTextStroke: "2px white"
          }}>
            {rest}
          </div>
        </div>
      )})}
    </div>
  )
}

export default OleoPageHeader
