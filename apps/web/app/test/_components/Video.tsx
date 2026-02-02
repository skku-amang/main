import * as React from "react"
import { cn } from "@/lib/utils"

type VideoSize = "xs" | "sm" | "md" | "lg"

interface VideoProps {
  youtubeUrl: string
  size?: VideoSize
  className?: string
}

const SIZE_STYLES: Record<
  VideoSize,
  { radius: string; play: string; playIcon: string }
> = {
  xs: { radius: "rounded-md", play: "h-10 w-10", playIcon: "h-5 w-5" },
  sm: { radius: "rounded-lg", play: "h-12 w-12", playIcon: "h-6 w-6" },
  md: { radius: "rounded-xl", play: "h-14 w-14", playIcon: "h-7 w-7" },
  lg: { radius: "rounded-2xl", play: "h-16 w-16", playIcon: "h-8 w-8" }
}

function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1)
      return id ? id : null
    }

    const v = parsed.searchParams.get("v")
    if (v) return v

    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.split("/embed/")[1]
      return id ? id : null
    }

    return null
  } catch {
    return null
  }
}

export default function Video({
  youtubeUrl,
  size = "md",
  className
}: VideoProps) {
  const videoId = React.useMemo(() => getYoutubeId(youtubeUrl), [youtubeUrl])
  const [isPlaying, setIsPlaying] = React.useState(false)
  const s = SIZE_STYLES[size]

  if (!videoId) {
    return (
      <div
        className={cn(
          "w-full rounded-lg bg-slate-100 p-4 text-sm text-slate-500",
          className
        )}
      >
        Invalid YouTube URL
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-black aspect-video",
        s.radius,
        className
      )}
    >
      {!isPlaying ? (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video thumbnail"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />

          <div
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-105",
              s.play
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className={cn("translate-x-[1px]", s.playIcon)}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  )
}
