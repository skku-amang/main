import React from "react"

import YoutubeVideo from "@/lib/youtube"

interface YoutubePlayerProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  videoUrl: string
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  videoUrl,
  ...iframeProps
}) => {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${YoutubeVideo.getValidVideoIdOrNull(videoUrl)}`}
      allowFullScreen
      {...iframeProps}
    />
  )
}

export default YoutubePlayer
