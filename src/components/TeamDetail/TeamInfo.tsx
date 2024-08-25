import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Team } from "../../../types/Team"
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
          <div className="flex col-span-1 lg:col-span-2 items-center justify-center">
            <div className="h-96 w-96">
              <ImageLoader alt={`${team.name} 사진`} src={team.posterImage} className="rounded-lg shadow-2xl" />
            </div>
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