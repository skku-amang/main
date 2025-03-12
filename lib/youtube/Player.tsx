import React from "react"

import YoutubeVideo from "@/lib/youtube"

interface YoutubePlayerProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  videoId: string
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  videoId,
  ...iframeProps
}) => {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${YoutubeVideo.getVideoId(videoId)}`}
      {...iframeProps}
    />
  )
}

export default YoutubePlayer
