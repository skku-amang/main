import { Oleo_Script } from "next/font/google"
import Link from "next/link"
import { RiArrowGoBackLine } from "react-icons/ri"

import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

const OleoPageHeader = ({
  title,
  className,
  goBackHref
}: {
  title: string
  className?: string
  goBackHref: string
}) => {
  const words = title.split(" ")

  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {/* 뒤로가기 버튼 */}
      <Link
        href={goBackHref}
        className="mt-2 flex items-center gap-x-5 font-semibold text-white"
      >
        <RiArrowGoBackLine className="text-white" />
        뒤로가기
      </Link>
      <div className="flex pb-[57px] pt-[100px] text-9xl max-[768px]:text-7xl max-[450px]:text-6xl max-[380px]:text-5xl">
        {words.map((word, i) => {
          const firstLetter = word.charAt(0)
          const rest = word.slice(1)

          return (
            <div className="flex" key={i}>
              <div className={cn(OleoScript.className, "italic text-gray-100")}>
                {firstLetter}
              </div>
              <div
                className={cn(OleoScript.className, "italic text-primary")}
                style={{
                  WebkitTextStroke: "2px white"
                }}
              >
                {rest}
              </div>
            </div>
          )
        })}
      </div>
      <div />
    </div>
  )
}

export default OleoPageHeader
