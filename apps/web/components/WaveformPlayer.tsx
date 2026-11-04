"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type WaveSurfer from "wavesurfer.js"

import {
  announceRecordingPlay,
  formatPlaybackTime,
  onOtherRecordingPlay
} from "@/lib/recordingPlayback"
import { cn } from "@/lib/utils"

type Status = "loading" | "ready" | "error"

// 잠금화면 컨트롤을 지금 쥐고 있는 재생기. 사라질 때 자기 것일 때만 비운다
let mediaSessionOwner: string | null = null

/**
 * 소리 크기 파형으로 그린 녹음본 재생기. 세게 치는 구간을 눈으로 찾아 누르면 거기로 이동한다.
 * 파형을 못 그리면(코덱 없는 브라우저, 네트워크 오류) 기본 재생기로 돌아간다.
 */
const WaveformPlayer = ({
  src,
  height = 64,
  className,
  title,
  artist
}: {
  src: string
  height?: number
  className?: string
  /** 있으면 잠금화면·알림센터 재생 컨트롤에 곡 정보를 띄운다 (Media Session) */
  title?: string
  artist?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [status, setStatus] = useState<Status>("loading")
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(Number.NaN)

  useEffect(() => {
    let cancelled = false
    let instance: WaveSurfer | null = null
    setStatus("loading")
    setPlaying(false)
    setCurrent(0)

    // 서버 렌더·첫 화면 번들에 넣지 않으려고 화면에 붙은 뒤에 불러온다
    void import("wavesurfer.js").then(({ default: WaveSurferLib }) => {
      if (cancelled || !containerRef.current) return
      instance = WaveSurferLib.create({
        container: containerRef.current,
        url: src,
        height,
        waveColor: "#cbd5e1",
        progressColor: "#1e3a8a",
        cursorColor: "#1e3a8a",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        dragToSeek: true
      })
      instance.on("ready", (d) => {
        setDuration(d)
        setStatus("ready")
      })
      instance.on("play", () => {
        setPlaying(true)
        if (title && "mediaSession" in navigator) {
          mediaSessionOwner = src
          navigator.mediaSession.metadata = new MediaMetadata({ title, artist })
          navigator.mediaSession.setActionHandler("play", () => {
            void instance?.play()
          })
          navigator.mediaSession.setActionHandler("pause", () => {
            instance?.pause()
          })
        }
      })
      instance.on("pause", () => setPlaying(false))
      instance.on("finish", () => setPlaying(false))
      instance.on("timeupdate", setCurrent)
      instance.on("error", () => setStatus("error"))
      wavesurferRef.current = instance
    })

    return () => {
      cancelled = true
      instance?.destroy()
      wavesurferRef.current = null
      if (mediaSessionOwner === src && "mediaSession" in navigator) {
        mediaSessionOwner = null
        navigator.mediaSession.metadata = null
        navigator.mediaSession.setActionHandler("play", null)
        navigator.mediaSession.setActionHandler("pause", null)
      }
    }
  }, [src, height, title, artist])

  useEffect(
    () => onOtherRecordingPlay(src, () => wavesurferRef.current?.pause()),
    [src]
  )

  function toggle() {
    const wavesurfer = wavesurferRef.current
    if (!wavesurfer) return
    if (!wavesurfer.isPlaying()) announceRecordingPlay(src)
    void wavesurfer.playPause()
  }

  if (status === "error") {
    return (
      // 연주 녹음이라 자막 트랙이 없다
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio
        controls
        preload="metadata"
        src={src}
        className={cn("w-full", className)}
      />
    )
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={status !== "ready"}
        aria-label={playing ? "녹음본 일시정지" : "녹음본 재생"}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {status === "loading" && (
            <div className="absolute inset-0 animate-pulse rounded bg-slate-100" />
          )}
          <div ref={containerRef} aria-hidden className="w-full" />
        </div>
        <p className="mt-1 text-xs tabular-nums text-slate-500">
          {formatPlaybackTime(current)} / {formatPlaybackTime(duration)}
        </p>
      </div>
    </div>
  )
}

export default WaveformPlayer
