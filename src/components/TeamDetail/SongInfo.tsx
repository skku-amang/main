import { FaMusic } from "react-icons/fa";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import YoutubeVideo from "@/lib/youtube";
import YoutubePlayer from "@/lib/youtube/Player"

import { Song } from "../../../types/Team"

const SongInfo = ({ song }: { song: Song }) => {
  const videoId = YoutubeVideo.getVideoId(song.original_url);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{song.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {song.cover_url ?
          <YoutubePlayer
            videoId={videoId}
            width="100%"
            style={{
              aspectRatio: '16/9',
            }}
            className='rounded-2xl shadow-black shadow-lg' />
          :
          <FaMusic size={24} />
        }
      </CardContent>
    </Card>
  )
}

export default SongInfo