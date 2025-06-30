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
  const backButtonPaddingX = 27
  const backButtonWidth = 91

  return (
    <div
      className={cn(
        "my-2.5 flex h-[70px] w-full items-end justify-center md:mb-[54px] md:mt-[100px] md:items-center md:justify-between",
        className
      )}
    >
      {/* 뒤로가기 버튼 */}
      <Link
        href={goBackHref}
        className={cn(
          "hidden items-center gap-x-6 px-[27px] py-2 font-semibold text-white md:flex",
          {
            width: backButtonWidth
          }
        )}
      >
        <RiArrowGoBackLine className="text-white" size={12} />
        뒤로가기
      </Link>

      <div className="flex text-[40px] font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:text-[100px]">
        {words.map((word, i) => {
          const firstLetter = word.charAt(0)
          const rest = word.slice(1)

          return (
            <div className="flex" key={i}>
              <div className={cn(OleoScript.className, "text-white")}>
                {firstLetter}
              </div>
              <div
                className={cn(OleoScript.className, "text-primary")}
                style={{
                  WebkitTextStroke: "3px white",
                  paintOrder: "stroke fill"
                }}
              >
                {rest}
              </div>
            </div>
          )
        })}
      </div>

      {/* 중앙 정렬용 공간 */}
      <div
        style={{ width: backButtonWidth + backButtonPaddingX * 2 }}
        className="hidden md:block"
      />
    </div>
  )
}

export default OleoPageHeader
