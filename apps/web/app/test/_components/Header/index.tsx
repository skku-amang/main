"use client"

import OleoPageHeader from "./OleoPageHeader"
import { cn } from "@/lib/utils"

interface HeaderCustomedProps {
  /** 헤더 제목 */
  title: string
  /** 뒤로가기 링크 (없으면 버튼 숨김) */
  goBackHref?: string
  /** 배경 색상 (Tailwind 클래스나 hex 가능) */
  backgroundColor?: string
  /** clipPath를 커스터마이징하고 싶을 때 */
  clipPath?: string
  /** 추가 className */
  className?: string
  /** 헤더 높이 (Tailwind class로) */
  heightClassName?: string
  /** 위쪽 여백 (제목이 내려오는 정도 조절) */
  paddingTop?: string
}

export default function HeaderCustomed({
  title,
  goBackHref,
  backgroundColor = "bg-primary",
  clipPath = "polygon(0 0, 100% 0, 100% 60%, 0% 100%)",
  className,
  heightClassName = "h-96",
  paddingTop = "pt-52"
}: HeaderCustomedProps) {
  return (
    <div className={cn("relative", heightClassName, paddingTop, className)}>
      {/* 배경 1 (보조색) */}
      <div
        className="absolute left-0 top-0 z-0 h-full w-full bg-slate-300"
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      />

      {/* 배경 2 (메인색) */}
      <div
        className={cn("absolute left-0 top-0 h-full w-full", backgroundColor)}
        style={{ clipPath }}
      />

      {/* 제목 */}
      <OleoPageHeader
        title={title}
        goBackHref={goBackHref}
        className="relative z-10 mt-10 md:mt-20"
      />
    </div>
  )
}
