import ImageLoader from '@/components/ImageLoader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Team } from '@/types/Team'

interface TeamDescriptionProps {
  team: Team
}

const TeamInfo = ({ team }: TeamDescriptionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name ? team.name : '팀 소개'}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 팀 포스터 */}
        {team.posterImage && (
          <div className="mb-3 overflow-hidden rounded-lg shadow-xl lg:mb-6">
            <ImageLoader alt={`${team.name} 사진`} src={team.posterImage} />
          </div>
        )}

        {/* 팀 설명 */}
        <CardDescription>{team.description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export default TeamInfo
