import React from "react"
import { cn } from "@/lib/utils"

interface VideoCustomedProps {
  /** 유튜브 영상 URL (watch?v= 또는 embed/ 형식 모두 가능) */
  videoUrl: string
  /** 크기 (sm: 515x311, lg: 1152x673) */
  variant?: "sm" | "lg"
  /** 추가 className */
  className?: string
}

/**
 * VideoCustomed — 자동 embed 변환 + 크기 프리셋(sm/lg) 지원
 */
export default function VideoCustomed({
  videoUrl,
  variant = "lg",
  className
}: VideoCustomedProps) {
  // URL을 embed용으로 자동 변환
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url)

      // 일반 watch?v= 형식이면 embed로 변환
      if (
        urlObj.hostname.includes("youtube.com") &&
        urlObj.searchParams.get("v")
      ) {
        const videoId = urlObj.searchParams.get("v")
        return `https://www.youtube.com/embed/${videoId}`
      }

      if (urlObj.hostname === "youtu.be") {
        const videoId = urlObj.pathname.slice(1)
        return `https://www.youtube.com/embed/${videoId}`
      }
      return url
    } catch {
      return ""
    }
  }

  const embedUrl = getEmbedUrl(videoUrl)

  const sizeClass =
    variant === "sm" ? "w-[515px] h-[311px]" : "w-[1152px] h-[673px]"

  return (
    <div className={cn("relative overflow-hidden", sizeClass, className)}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  )
}
