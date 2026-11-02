"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// 목록에서 여러 곡이 겹쳐 나오지 않게 — 하나가 재생되면 나머지는 멈춘다
const PLAY_EVENT = "amang:recording-play"

const formatTime = (sec: number) =>
  Number.isFinite(sec)
    ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`
    : "0:00"

/** 표 칸에 들어가는 작은 녹음본 재생 버튼 */
const RecordingPlayButton = ({
  src,
  className
}: {
  src: string
  className?: string
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(Number.NaN)

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== src) audioRef.current?.pause()
    }
    window.addEventListener(PLAY_EVENT, onOtherPlay)
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay)
  }, [src])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: src }))
      void audio.play()
    } else {
      audio.pause()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "녹음본 일시정지" : "녹음본 재생"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs tabular-nums text-slate-700 hover:bg-slate-50",
        className
      )}
    >
      {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      {playing || current > 0
        ? `${formatTime(current)} / ${formatTime(duration)}`
        : formatTime(duration)}
      {/* 연주 녹음이라 자막 트랙이 없다 */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setCurrent(0)
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </button>
  )
}

export default RecordingPlayButton
