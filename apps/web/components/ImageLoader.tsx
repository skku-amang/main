"use client"

import Image from "next/image"
import React from "react"
import { useState } from "react"

import { cn } from "../lib/utils"

function ImageLoader({
  src,
  alt,
  className
}: {
  src: string
  alt: string
  className?: string
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [parentHeight, setParentHeight] = useState(0)

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setIsImageLoaded(true)
    setParentHeight(e.currentTarget.naturalHeight)
  }

  return (
    <div
      className={cn(className, "relative w-full")}
      style={{ height: parentHeight }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          opacity: isImageLoaded ? 1 : 0.8,
          transition: "opacity 1s ease-in-out"
        }}
        onLoad={handleImageLoad}
      />
      {!isImageLoaded && (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gray-500">
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}

export default ImageLoader
