import { FaMusic } from "react-icons/fa"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import YoutubeVideo from "@/lib/youtube"
import YoutubePlayer from "@/lib/youtube/Player"

interface SongInfoProps {
  songName: string
  songArtist: string
  songYoutubeUrl?: string
}

const SongInfo = ({ songName, songArtist, songYoutubeUrl }: SongInfoProps) => {
  let videoId
  try {
    if (songYoutubeUrl) {
      videoId = YoutubeVideo.getVideoId(songYoutubeUrl)
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("올바르지 않은 URL입니다.")
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{songName}</CardTitle>
      </CardHeader>
      <CardContent>
        {videoId ? (
          <YoutubePlayer
            videoId={videoId}
            width="100%"
            style={{
              aspectRatio: "16/9"
            }}
            className="rounded-2xl shadow-lg shadow-black"
          />
        ) : (
          <FaMusic size={24} />
        )}
      </CardContent>
    </Card>
  )
}

export default SongInfo
