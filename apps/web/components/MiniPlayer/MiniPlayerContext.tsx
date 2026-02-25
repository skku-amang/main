"use client"

import { createContext, useCallback, useContext, useState } from "react"

interface MiniPlayerState {
  videoId: string
  title: string
}

interface MiniPlayerContextType {
  current: MiniPlayerState | null
  play: (videoId: string, title: string) => void
  close: () => void
}

const MiniPlayerContext = createContext<MiniPlayerContextType | null>(null)

export const MiniPlayerProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [current, setCurrent] = useState<MiniPlayerState | null>(null)

  const play = useCallback((videoId: string, title: string) => {
    setCurrent({ videoId, title })
  }, [])

  const close = useCallback(() => {
    setCurrent(null)
  }, [])

  return (
    <MiniPlayerContext.Provider value={{ current, play, close }}>
      {children}
    </MiniPlayerContext.Provider>
  )
}

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext)
  if (!context) {
    throw new Error("useMiniPlayer must be used within MiniPlayerProvider")
  }
  return context
}
