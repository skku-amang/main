import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

import { Team } from "../../types/Team"
import ImageLoader from "../common/ImageLoader"

interface TeamDescriptionProps {
  team: Team
}

const TeamInfo = ({ team }: TeamDescriptionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name ? team.name : "팀 소개"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 팀 포스터 */}
        {team.posterImage && (
          <div className="mb-3 lg:mb-6 rounded-lg shadow-xl overflow-hidden">
            <ImageLoader alt={`${team.name} 사진`} src={team.posterImage} />
          </div>
        )}

        {/* 팀 설명 */}
        <CardDescription>
          {team.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export default TeamInfo