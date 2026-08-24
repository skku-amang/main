import React from "react"
import { extractYoutubeVideoId, getYoutubeEmbedUrl } from "@repo/shared-types"

interface YoutubePlayerProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  videoUrl: string
  title: string
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  videoUrl,
  title,
  ...iframeProps
}) => {
  const videoId = extractYoutubeVideoId(videoUrl)
  if (!videoId) return null

  return (
    <iframe
      src={getYoutubeEmbedUrl(videoId)}
      title={title}
      allowFullScreen
      {...iframeProps}
    />
  )
}

export default YoutubePlayer
