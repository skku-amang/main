import { Oleo_Script } from "next/font/google"
import Link from "next/link"
import { RiArrowGoBackLine } from "react-icons/ri"
import { cn } from "@/lib/utils"

const OleoScript = Oleo_Script({ subsets: ["latin"], weight: "400" })

interface OleoPageHeaderProps {
  /** 제목 */
  title: string
  /** 추가 className */
  className?: string
  /** 뒤로가기 링크 (없으면 버튼 안 보임) */
  goBackHref?: string
}

export default function OleoPageHeader({
  title,
  className,
  goBackHref
}: OleoPageHeaderProps) {
  const words = title.split(" ")

  return (
    <div
      className={cn(
        "flex h-[70px] w-full items-end justify-center md:items-center md:justify-between",
        "mt-10 md:mt-16 md:mb-[54px]",
        className
      )}
    >
      {/* 뒤로가기 버튼 */}
      {goBackHref && (
        <Link
          href={goBackHref}
          className="hidden md:flex items-center gap-2 px-6 py-2 font-semibold text-white hover:opacity-80 transition-opacity"
        >
          <RiArrowGoBackLine className="text-white" size={14} />
          뒤로가기
        </Link>
      )}

      {/* 제목 */}
      <h1 className="flex text-[40px] md:text-[100px] font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        {words.map((word, i) => {
          const firstLetter = word.charAt(0)
          const rest = word.slice(1)
          return (
            <span key={i} className="flex">
              <span className={cn(OleoScript.className, "text-white")}>
                {firstLetter}
              </span>
              <span
                className={cn(OleoScript.className, "text-primary")}
                style={{
                  WebkitTextStroke: "3px white",
                  paintOrder: "stroke fill"
                }}
              >
                {rest}
              </span>
            </span>
          )
        })}
      </h1>

      {/* 균형 맞추기용 공간 */}
      <div className="hidden md:block w-[145px]" />
    </div>
  )
}
