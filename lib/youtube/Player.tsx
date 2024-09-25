import React from "react"

interface YoutubePlayerProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  videoId: string
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  videoId,
  ...iframeProps
}) => {
  return (
    <iframe src={`https://www.youtube.com/embed/${videoId}`} {...iframeProps} />
  )
}

export default YoutubePlayer
